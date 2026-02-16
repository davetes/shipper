import "dotenv/config";
import cors from "cors";
import express from "express";
import http from "http";
import { Server } from "socket.io";
import { authRouter } from "./routes/auth.js";
import { usersRouter } from "./routes/users.js";
import { chatsRouter } from "./routes/chats.js";
import { prisma } from "./lib/prisma.js";
import { verifyAccessToken } from "./lib/jwt.js";

const app = express();
app.use(express.json());

const clientOrigin = process.env.CLIENT_ORIGIN ?? "http://localhost:8080";
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRouter);
app.use("/api/users", usersRouter);
app.use("/api/chats", chatsRouter);

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: clientOrigin,
    credentials: true,
  },
});

type PresenceUser = { userId: string; name: string; avatarUrl?: string | null };
const online = new Map<string, PresenceUser>();

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token || typeof token !== "string") return next(new Error("Missing token"));

  try {
    const payload = verifyAccessToken(token);
    socket.data.user = { userId: payload.sub, name: payload.name, avatarUrl: payload.avatarUrl };
    next();
  } catch {
    next(new Error("Invalid token"));
  }
});

io.on("connection", async (socket) => {
  const user = socket.data.user as PresenceUser;
  online.set(socket.id, user);

  io.emit(
    "presence:update",
    Array.from(online.values()).reduce<Record<string, PresenceUser>>((acc, u) => {
      acc[u.userId] = u;
      return acc;
    }, {})
  );

  socket.on("chat:join", async ({ chatId }: { chatId: string }) => {
    await socket.join(`chat:${chatId}`);
  });

  socket.on("chat:leave", async ({ chatId }: { chatId: string }) => {
    await socket.leave(`chat:${chatId}`);
  });

  socket.on("chat:message", async ({ chatId, text }: { chatId: string; text: string }) => {
    if (!text?.trim()) return;

    const member = await prisma.chatMember.findFirst({ where: { chatId, userId: user.userId } });
    if (!member) return;

    const message = await prisma.message.create({
      data: {
        chatId,
        senderId: user.userId,
        text,
      },
      include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
    });

    await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

    io.to(`chat:${chatId}`).emit("chat:message", { message });
  });

  socket.on("disconnect", () => {
    online.delete(socket.id);
    io.emit(
      "presence:update",
      Array.from(online.values()).reduce<Record<string, PresenceUser>>((acc, u) => {
        acc[u.userId] = u;
        return acc;
      }, {})
    );
  });
});

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});

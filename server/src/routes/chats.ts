import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import type { AuthedRequest } from "../middleware/auth.js";
import { requireAuth } from "../middleware/auth.js";

export const chatsRouter = Router();

chatsRouter.get("/", requireAuth, async (req: AuthedRequest, res) => {
  const userId = req.user!.id;

  const chats = await prisma.chat.findMany({
    where: { members: { some: { userId } } },
    orderBy: { updatedAt: "desc" },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
      messages: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  return res.json({ chats });
});

chatsRouter.post("/start", requireAuth, async (req: AuthedRequest, res) => {
  const body = z.object({ userId: z.string().min(1) }).safeParse(req.body);
  if (!body.success) return res.status(400).json({ error: "Invalid payload" });

  const me = req.user!.id;
  const other = body.data.userId;
  if (me === other) return res.status(400).json({ error: "Cannot chat with yourself" });

  const existing = await prisma.chat.findFirst({
    where: {
      AND: [
        { members: { some: { userId: me } } },
        { members: { some: { userId: other } } },
      ],
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
    },
  });

  if (existing) return res.json({ chat: existing });

  const chat = await prisma.chat.create({
    data: {
      members: {
        create: [{ userId: me }, { userId: other }],
      },
    },
    include: {
      members: { include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } } },
    },
  });

  return res.json({ chat });
});

chatsRouter.get("/:chatId/messages", requireAuth, async (req: AuthedRequest, res) => {
  const chatId = req.params.chatId;
  const userId = req.user!.id;

  const limitRaw = req.query.limit;
  const limitParsed = typeof limitRaw === "string" ? Number(limitRaw) : undefined;
  const limit = Number.isFinite(limitParsed)
    ? Math.max(1, Math.min(1000, Math.floor(limitParsed!)))
    : 200;

  const isMember = await prisma.chatMember.findFirst({ where: { chatId, userId } });
  if (!isMember) return res.status(403).json({ error: "Forbidden" });

  const messagesDesc = await prisma.message.findMany({
    where: { chatId },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { sender: { select: { id: true, name: true, avatarUrl: true } } },
  });

  const messages = messagesDesc.reverse();

  return res.json({ messages });
});

chatsRouter.delete("/:chatId/messages", requireAuth, async (req: AuthedRequest, res) => {
  const chatId = req.params.chatId;
  const userId = req.user!.id;

  const isMember = await prisma.chatMember.findFirst({ where: { chatId, userId } });
  if (!isMember) return res.status(403).json({ error: "Forbidden" });

  await prisma.message.deleteMany({ where: { chatId } });
  await prisma.chat.update({ where: { id: chatId }, data: { updatedAt: new Date() } });

  return res.json({ ok: true });
});

chatsRouter.delete("/:chatId", requireAuth, async (req: AuthedRequest, res) => {
  const chatId = req.params.chatId;
  const userId = req.user!.id;

  const isMember = await prisma.chatMember.findFirst({ where: { chatId, userId } });
  if (!isMember) return res.status(403).json({ error: "Forbidden" });

  await prisma.chatMember.delete({ where: { chatId_userId: { chatId, userId } } });

  const remaining = await prisma.chatMember.count({ where: { chatId } });
  if (remaining === 0) {
    await prisma.chat.delete({ where: { id: chatId } });
  }

  return res.json({ ok: true });
});

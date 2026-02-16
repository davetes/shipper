import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../lib/prisma.js";
import { signAccessToken } from "../lib/jwt.js";

export const authRouter = Router();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client();

authRouter.post("/signup", async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(6),
      name: z.string().min(1),
    })
    .safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({
      error: body.error.issues.map((i) => i.message).join(", "),
    });
  }

  const existing = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (existing) return res.status(409).json({ error: "Email already in use" });

  const passwordHash = await bcrypt.hash(body.data.password, 10);
  const user = await prisma.user.create({
    data: {
      email: body.data.email,
      passwordHash,
      name: body.data.name,
      avatarUrl: null,
    },
    select: { id: true, email: true, name: true, avatarUrl: true },
  });

  const token = signAccessToken({ sub: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
  return res.json({ token, user });
});

authRouter.post("/login", async (req, res) => {
  const body = z
    .object({
      email: z.string().email(),
      password: z.string().min(1),
    })
    .safeParse(req.body);

  if (!body.success) {
    return res.status(400).json({
      error: body.error.issues.map((i) => i.message).join(", "),
    });
  }

  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (!user?.passwordHash) return res.status(401).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(body.data.password, user.passwordHash);
  if (!ok) return res.status(401).json({ error: "Invalid credentials" });

  const token = signAccessToken({ sub: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
  return res.json({
    token,
    user: { id: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl },
  });
});

authRouter.post("/google", async (req, res) => {
  const body = z.object({ credential: z.string().min(1) }).safeParse(req.body);
  if (!body.success) {
    return res.status(400).json({
      error: body.error.issues.map((i) => i.message).join(", "),
    });
  }

  if (!googleClientId) return res.status(500).json({ error: "GOOGLE_CLIENT_ID is not set" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: body.data.credential,
      audience: googleClientId,
    });
    const payload = ticket.getPayload();
    const email = payload?.email;
    const name = payload?.name;
    const avatarUrl = payload?.picture;

    if (!email || !name) return res.status(400).json({ error: "Google token missing email/name" });

    const user = await prisma.user.upsert({
      where: { email },
      update: { name, avatarUrl },
      create: {
        email,
        name,
        avatarUrl,
        passwordHash: null,
      },
      select: { id: true, email: true, name: true, avatarUrl: true },
    });

    const token = signAccessToken({ sub: user.id, email: user.email, name: user.name, avatarUrl: user.avatarUrl });
    return res.json({ token, user });
  } catch {
    return res.status(401).json({ error: "Invalid Google credential" });
  }
});

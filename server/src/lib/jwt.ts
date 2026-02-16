import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

export type JwtUser = {
  sub: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

const secret = process.env.JWT_SECRET;

export function signAccessToken(payload: JwtUser) {
  if (!secret) throw new Error("JWT_SECRET is not set");
  const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN ?? "7d" };
  return jwt.sign(payload, secret as Secret, options);
}

export function verifyAccessToken(token: string) {
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, secret as Secret) as JwtUser;
}

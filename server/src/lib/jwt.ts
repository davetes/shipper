import jwt from "jsonwebtoken";
import type { Secret, SignOptions } from "jsonwebtoken";

export type JwtUser = {
  sub: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

const secret = process.env.JWT_SECRET;

function getExpiresIn(): SignOptions["expiresIn"] {
  const v = process.env.JWT_EXPIRES_IN;
  if (!v) return "7d";
  const asNumber = Number(v);
  if (Number.isFinite(asNumber) && v.trim() !== "") return asNumber;
  return v as unknown as SignOptions["expiresIn"];
}

export function signAccessToken(payload: JwtUser) {
  if (!secret) throw new Error("JWT_SECRET is not set");
  const options: SignOptions = { expiresIn: getExpiresIn() };
  return jwt.sign(payload, secret as Secret, options);
}

export function verifyAccessToken(token: string) {
  if (!secret) throw new Error("JWT_SECRET is not set");
  return jwt.verify(token, secret as Secret) as JwtUser;
}

import { io, type Socket } from "socket.io-client";
import { getToken } from "./auth";

const API_BASE = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:4000";

let socket: Socket | null = null;

export function getSocket() {
  if (socket) return socket;

  const token = getToken();
  socket = io(API_BASE, {
    autoConnect: false,
    auth: {
      token,
    },
  });

  return socket;
}

export function connectSocket() {
  const s = getSocket();
  const token = getToken();
  s.auth = { token };
  if (!s.connected) s.connect();
  return s;
}

export function disconnectSocket() {
  if (!socket) return;
  socket.disconnect();
}

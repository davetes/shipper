export type AuthUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
};

const TOKEN_KEY = "chatapp_token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export type PresenceStatus = "online" | "offline";

export type UiUser = {
  id: string;
  name: string;
  email?: string | null;
  avatar?: string | null;
  status: PresenceStatus;
  lastSeen?: string;
  statusMessage?: string;
};

export type UiMessage = {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: "text";
};

export type UiChat = {
  id: string;
  userId: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  messages: UiMessage[];
};

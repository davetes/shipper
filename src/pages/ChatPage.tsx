import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  ChevronLeft,
  ChevronDown,
  Compass,
  Gift,
  LogOut,
  Pencil,
  Folder,
  Home,
  MessageCircle,
  Phone,
  Search,
  Sparkle,
  Settings,
  Sparkles,
  Video,
  X,
} from "lucide-react";
import ChatList from "@/components/chat/ChatList";
import ConversationView from "@/components/chat/ConversationView";
import ContactsList from "@/components/chat/ContactsList";
import GroupsList from "@/components/chat/GroupsList";
import GroupConversation from "@/components/chat/GroupConversation";
import StoriesView from "@/components/chat/StoriesView";
import SettingsView from "@/components/chat/SettingsView";
import EmptyChat from "@/components/chat/EmptyChat";
import { groups as initialGroups, Chat, Group, Message, User } from "@/data/mockData";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { mediaGallery } from "@/data/mockData";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Progress } from "@/components/ui/progress";
import { clearToken } from "@/lib/auth";
import { apiFetch } from "@/lib/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";

const ChatPage = () => {
  const navigate = useNavigate();
  const [section, setSection] = useState<"chats" | "contacts" | "groups" | "stories" | "settings">("chats");
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [chatData, setChatData] = useState<Chat[]>([]);
  const [groupData, setGroupData] = useState<Group[]>(initialGroups);
  const [archivedChatIds, setArchivedChatIds] = useState<Set<string>>(() => new Set());
  const [contactInfoOpen, setContactInfoOpen] = useState(false);
  const [contactInfoUserId, setContactInfoUserId] = useState<string | null>(null);
  const [me, setMe] = useState<{ id: string; name: string; email: string; avatarUrl?: string | null } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [presenceByUserId, setPresenceByUserId] = useState<Record<string, { userId: string; name: string; avatarUrl?: string | null }>>({});
  const [sharedLinks, setSharedLinks] = useState<string[]>([]);
  const [sharedMedia, setSharedMedia] = useState<string[]>([]);
  const [sharedDocs, setSharedDocs] = useState<string[]>([]);

  const handleLogout = () => {
    clearToken();
    navigate("/");
  };

  const handleOpenContactInfo = (userId: string) => {
    setContactInfoUserId(userId);
    setContactInfoOpen(true);
  };

  const currentUser: User = useMemo(() => {
    return {
      id: me?.id ?? "me",
      name: me?.name ?? "Me",
      avatar: me?.avatarUrl ?? "https://i.pravatar.cc/150?img=68",
      status: "online",
      email: me?.email,
    };
  }, [me]);

  const getUserById = useCallback(
    (id: string) => {
      if (id === currentUser.id) return currentUser;
      return users.find((u) => u.id === id);
    },
    [currentUser, users]
  );

  const contactUser = contactInfoUserId ? getUserById(contactInfoUserId) : undefined;

  const extractUrls = useCallback((text: string) => {
    const httpRe = /(https?:\/\/[^\s)\]}>\"]+)/gi;
    const wwwRe = /(^|\s)(www\.[^\s)\]}>\"]+)/gi;

    const httpUrls = Array.from(text.matchAll(httpRe)).map((m) => m[1]);
    const wwwUrls = Array.from(text.matchAll(wwwRe)).map((m) => `https://${m[2]}`);

    return [...httpUrls, ...wwwUrls];
  }, []);

  const isImageUrl = useCallback((url: string) => {
    try {
      const u = new URL(url);
      const p = u.pathname.toLowerCase();
      return p.endsWith(".png") || p.endsWith(".jpg") || p.endsWith(".jpeg") || p.endsWith(".gif") || p.endsWith(".webp") || p.endsWith(".svg");
    } catch {
      return false;
    }
  }, []);

  const isDocUrl = useCallback((url: string) => {
    try {
      const u = new URL(url);
      const p = u.pathname.toLowerCase();
      return (
        p.endsWith(".pdf") ||
        p.endsWith(".doc") ||
        p.endsWith(".docx") ||
        p.endsWith(".xls") ||
        p.endsWith(".xlsx") ||
        p.endsWith(".ppt") ||
        p.endsWith(".pptx") ||
        p.endsWith(".txt")
      );
    } catch {
      return false;
    }
  }, []);

  useEffect(() => {
    if (!contactInfoOpen || !contactInfoUserId) return;
    const chat = chatData.find((c) => c.userId === contactInfoUserId);
    if (!chat) {
      setSharedLinks([]);
      setSharedMedia([]);
      setSharedDocs([]);
      return;
    }

    (async () => {
      try {
        const res = await apiFetch<{
          messages: Array<{ id: string; text: string; createdAt: string; senderId: string }>;
        }>(`/api/chats/${chat.id}/messages?limit=1000`);

        const urls = res.messages.flatMap((m) => extractUrls(m.text ?? ""));
        const unique = Array.from(new Set(urls));

        const media = unique.filter(isImageUrl);
        const docs = unique.filter(isDocUrl);
        const links = unique.filter((u) => !media.includes(u) && !docs.includes(u));

        setSharedLinks(links);
        setSharedMedia(media);
        setSharedDocs(docs);
      } catch {
        setSharedLinks([]);
        setSharedMedia([]);
        setSharedDocs([]);
      }
    })();
  }, [apiFetch, chatData, contactInfoOpen, contactInfoUserId, extractUrls, isDocUrl, isImageUrl]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [{ user: meRes }, { users: usersRes }] = await Promise.all([
          apiFetch<{ user: { id: string; email: string; name: string; avatarUrl?: string | null } }>("/api/users/me"),
          apiFetch<{ users: Array<{ id: string; email: string; name: string; avatarUrl?: string | null }> }>("/api/users"),
        ]);

        if (cancelled) return;
        setMe(meRes);

        const mappedUsers: User[] = usersRes.map((u) => ({
          id: u.id,
          name: u.name,
          avatar: u.avatarUrl ?? `https://i.pravatar.cc/150?u=${encodeURIComponent(u.id)}`,
          status: presenceByUserId[u.id] ? "online" : "offline",
          email: u.email,
          lastSeen: presenceByUserId[u.id] ? undefined : "Offline",
        }));
        setUsers(mappedUsers);
      } catch (e: any) {
        toast({ title: "Failed to load user profile" });
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!me) return;

    let cancelled = false;

    (async () => {
      try {
        const res = await apiFetch<{
          chats: Array<{
            id: string;
            updatedAt: string;
            members: Array<{ user: { id: string; name: string; email: string; avatarUrl?: string | null } }>;
            messages: Array<{ id: string; text: string; createdAt: string; senderId: string }>;
          }>;
        }>("/api/chats");

        if (cancelled) return;

        const mapped: Chat[] = res.chats
          .map((c) => {
            const other = c.members.map((m) => m.user).find((u) => u.id !== me.id);
            if (!other) return null;

            const last = c.messages?.[0];
            return {
              id: c.id,
              userId: other.id,
              lastMessage: last?.text ?? "",
              lastMessageTime: last ? last.createdAt : "",
              unreadCount: 0,
              messages: [],
            };
          })
          .filter(Boolean) as Chat[];

        setChatData(mapped);
      } catch {
        toast({ title: "Failed to load chats" });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [me]);

  useEffect(() => {
    const socket = connectSocket();

    const onPresenceUpdate = (onlineMap: Record<string, { userId: string; name: string; avatarUrl?: string | null }>) => {
      setPresenceByUserId(onlineMap);
      setUsers((prev) =>
        prev.map((u) => ({
          ...u,
          status: onlineMap[u.id] ? "online" : "offline",
          lastSeen: onlineMap[u.id] ? undefined : u.lastSeen ?? "Offline",
          avatar: onlineMap[u.id]?.avatarUrl ?? u.avatar,
          name: onlineMap[u.id]?.name ?? u.name,
        }))
      );
    };

    const onChatMessage = ({ message }: { message: { id: string; chatId: string; text: string; createdAt: string; senderId: string } }) => {
      setChatData((prev) =>
        prev.map((c) => {
          if (c.id !== message.chatId) return c;
          const newMsg: Message = {
            id: message.id,
            senderId: message.senderId,
            text: message.text,
            timestamp: message.createdAt,
            type: "text",
          };
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: message.text,
            lastMessageTime: message.createdAt,
          };
        })
      );
    };

    socket.on("presence:update", onPresenceUpdate);
    socket.on("chat:message", onChatMessage);

    return () => {
      socket.off("presence:update", onPresenceUpdate);
      socket.off("chat:message", onChatMessage);
      disconnectSocket();
    };
  }, []);

  useEffect(() => {
    const socket = connectSocket();
    if (!activeChatId) return;

    socket.emit("chat:join", { chatId: activeChatId });
    return () => {
      socket.emit("chat:leave", { chatId: activeChatId });
    };
  }, [activeChatId]);

  useEffect(() => {
    if (!activeChatId) return;

    (async () => {
      try {
        const res = await apiFetch<{
          messages: Array<{ id: string; text: string; createdAt: string; senderId: string }>;
        }>(`/api/chats/${activeChatId}/messages`);

        setChatData((prev) =>
          prev.map((c) => {
            if (c.id !== activeChatId) return c;
            const mapped: Message[] = res.messages.map((m) => ({
              id: m.id,
              senderId: m.senderId,
              text: m.text,
              timestamp: m.createdAt,
              type: "text",
            }));
            return { ...c, messages: mapped };
          })
        );
      } catch {
        toast({ title: "Failed to load messages" });
      }
    })();
  }, [activeChatId]);

  const handleSendMessage = useCallback((chatId: string, text: string) => {
    const socket = connectSocket();
    socket.emit("chat:message", { chatId, text });
  }, []);

  const handleSendGroupMessage = useCallback((groupId: string, text: string) => {
    const newMsg: Message = {
      id: `gm-${Date.now()}`,
      senderId: "me",
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };
    setGroupData((prev) =>
      prev.map((g) =>
        g.id === groupId
          ? { ...g, messages: [...g.messages, newMsg], lastMessage: text, lastMessageTime: "Now", unreadCount: 0 }
          : g
      )
    );
  }, []);

  const handleContactClick = async (userId: string) => {
    const existingChat = chatData.find((c) => c.userId === userId);
    if (existingChat) {
      setSection("chats");
      setActiveChatId(existingChat.id);
      return;
    }

    try {
      const res = await apiFetch<{
        chat: {
          id: string;
          members: Array<{ user: { id: string; name: string; email: string; avatarUrl?: string | null } }>;
        };
      }>("/api/chats/start", {
        method: "POST",
        body: JSON.stringify({ userId }),
      });

      const chatId = res.chat.id;
      const newChat: Chat = {
        id: chatId,
        userId,
        lastMessage: "",
        lastMessageTime: "",
        unreadCount: 0,
        messages: [],
      };

      setChatData((prev) => [newChat, ...prev]);
      setSection("chats");
      setActiveChatId(chatId);
    } catch {
      toast({ title: "Failed to start chat" });
    }
  };

  const handleDeleteChat = (chatId: string) => {
    setChatData((prev) => prev.filter((c) => c.id !== chatId));
    setActiveChatId((prev) => (prev === chatId ? null : prev));
    toast({ title: "Chat deleted" });
  };

  const handleClearChat = (chatId: string) => {
    setChatData((prev) =>
      prev.map((c) =>
        c.id === chatId
          ? {
              ...c,
              messages: [],
              lastMessage: "",
              lastMessageTime: "Now",
              unreadCount: 0,
            }
          : c
      )
    );
    toast({ title: "Chat cleared" });
  };

  const handleToggleUnread = (chatId: string) => {
    let nextUnread = 0;
    setChatData((prev) =>
      prev.map((c) => {
        if (c.id !== chatId) return c;
        nextUnread = c.unreadCount > 0 ? 0 : 1;
        return { ...c, unreadCount: nextUnread };
      })
    );
    toast({ title: nextUnread > 0 ? "Marked as unread" : "Marked as read" });
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    setChatData((prev) => prev.map((c) => (c.id === chatId ? { ...c, unreadCount: 0 } : c)));
  };

  const handleToggleArchive = (chatId: string) => {
    setArchivedChatIds((prev) => {
      const next = new Set(prev);
      if (next.has(chatId)) {
        next.delete(chatId);
        toast({ title: "Unarchived" });
      } else {
        next.add(chatId);
        toast({ title: "Archived" });
      }
      return next;
    });
  };

  const activeChat = chatData.find((c) => c.id === activeChatId);
  const activeGroup = groupData.find((g) => g.id === activeGroupId);

  return (
    <div className="min-h-screen w-full bg-[#F3F3EE] p-4">
      <div className="mx-auto flex h-[1024px] w-[1440px] max-w-full gap-4 rounded-[24px] bg-[#F3F3EE] overflow-hidden">
        <div className="flex h-full w-[76px] shrink-0 flex-col items-center justify-between rounded-2xl bg-muted/30 px-4 pb-6 pt-0 shadow-sm">
          <div className="flex h-[328px] w-[44px] flex-col items-center gap-8">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="default"
                  size="icon"
                  className="h-[66px] w-[66px] rounded-full bg-transparent p-[11px] text-foreground hover:bg-muted/50 data-[state=open]:bg-muted/50"
                >
                  <img src="/icon.png" alt="New" className="h-[44px] w-[44px] rounded-full" />
                </Button>
              </PopoverTrigger>
              <PopoverContent
                align="start"
                side="right"
                sideOffset={0}
                alignOffset={64}
                className="flex h-[428px] w-[307px] -translate-x-[56px] flex-col gap-1 rounded-[16px] bg-white pb-1 pt-1 shadow-[0px_1px_13.8px_1px_#1212121A]"
              >
                <button
                  className="flex w-full items-center gap-[10px] rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                  onClick={() => {
                    navigate("/");
                  }}
                >
                  <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-[#F3F3EE] p-[6px]">
                    <ChevronLeft className="h-4 w-4" />
                  </div>
                  Go back to dashboard
                </button>
                <button
                  className="mt-1 flex h-[40px] w-[287px] items-center gap-2 rounded-[8px] bg-[#F8F8F5] p-[6px] text-sm hover:bg-[#F8F8F5]"
                  onClick={() => toast({ title: "Rename file" })}
                >
                  <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-[#F3F3EE] p-[6px]">
                    <Pencil className="h-4 w-4" />
                  </div>
                  Rename file
                </button>

                <Separator className="my-2" />

                <div className="px-1">
                  <div className="text-sm font-semibold text-foreground">testing2</div>
                  <div className="text-xs text-muted-foreground">testing2@gmail.com</div>
                </div>

                <div className="mt-3 flex h-[100px] w-[287px] flex-col gap-2 rounded-[8px] bg-[#F8F8F5] p-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[11px] text-muted-foreground">Credits</div>
                      <div className="text-sm font-semibold text-foreground">20 left</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[11px] text-muted-foreground">Renews in</div>
                      <div className="text-sm font-semibold text-foreground">6h 24m</div>
                    </div>
                  </div>
                  <div className="mt-2">
                    <Progress value={40} className="h-2" />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>5 of 25 used today</span>
                    <span className="text-emerald-700">+25 tomorrow</span>
                  </div>
                </div>

                <button
                  className="mt-2 flex w-full items-center gap-[10px] rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                  onClick={() => toast({ title: "Win free credits" })}
                >
                  <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-[#F3F3EE] p-[6px]">
                    <Gift className="h-4 w-4" />
                  </div>
                  Win free credits
                </button>
                <button
                  className="mt-1 flex w-full items-center gap-[10px] rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                  onClick={() => toast({ title: "Theme Style" })}
                >
                  <div className="flex h-[28px] w-[28px] items-center justify-center rounded-[6px] bg-[#F3F3EE] p-[6px]">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_0_2044)">
                        <path
                          d="M8.00016 1.33334V2M8.00016 14V14.6667M12.7142 3.28596L12.2428 3.75737M3.75753 12.2426L3.28612 12.714M14.6668 8H14.0002M2.00016 8H1.3335M12.7142 12.714L12.2428 12.2426M3.75753 3.75737L3.28612 3.28596M12.0002 8C12.0002 10.2091 10.2093 12 8.00016 12C5.79102 12 4.00016 10.2091 4.00016 8C4.00016 5.79086 5.79102 4 8.00016 4C10.2093 4 12.0002 5.79086 12.0002 8Z"
                          stroke="#28303F"
                          strokeLinecap="round"
                        />
                      </g>
                      <defs>
                        <clipPath id="clip0_0_2044">
                          <rect width="16" height="16" fill="white" />
                        </clipPath>
                      </defs>
                    </svg>
                  </div>
                  Theme Style
                </button>

                <Separator className="my-2" />

                <button
                  className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                  onClick={handleLogout}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M13.3335 9.33333L14.1954 8.47141C14.4558 8.21106 14.4558 7.78895 14.1954 7.5286L13.3335 6.66667"
                      stroke="#28303F"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M14.0002 8H8.66683M4.00016 13.3333C2.5274 13.3333 1.3335 12.1394 1.3335 10.6667V5.33333C1.3335 3.86058 2.5274 2.66667 4.00016 2.66667M4.00016 13.3333C5.47292 13.3333 6.66683 12.1394 6.66683 10.6667V5.33333C6.66683 3.86058 5.47292 2.66667 4.00016 2.66667M4.00016 13.3333H9.3335C10.8063 13.3333 12.0002 12.1394 12.0002 10.6667M4.00016 2.66667H9.3335C10.8063 2.66667 12.0002 3.86058 12.0002 5.33333"
                      stroke="#28303F"
                      strokeLinecap="round"
                    />
                  </svg>
                  Log out
                </button>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              type="button"
              onClick={(e) => e.preventDefault()}
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-[44px] w-[44px] min-w-[44px] max-w-[44px] gap-2 rounded-[8px] border border-[#1E9A80] bg-[#F0FDF4] px-3 py-2 text-foreground hover:bg-[#F0FDF4]"
              type="button"
              onClick={(e) => e.preventDefault()}
            >
              <MessageCircle className="h-5 w-5" strokeWidth={1.5} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              type="button"
              onClick={(e) => e.preventDefault()}
            >
              <Compass className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              type="button"
              onClick={(e) => e.preventDefault()}
            >
              <Folder className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              type="button"
              onClick={(e) => e.preventDefault()}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M16.25 2.5H6.25C5.91848 2.5 5.60054 2.6317 5.36612 2.86612C5.1317 3.10054 5 3.41848 5 3.75V5H3.75C3.41848 5 3.10054 5.1317 2.86612 5.36612C2.6317 5.60054 2.5 5.91848 2.5 6.25V16.25C2.5 16.5815 2.6317 16.8995 2.86612 17.1339C3.10054 17.3683 3.41848 17.5 3.75 17.5H13.75C14.0815 17.5 14.3995 17.3683 14.6339 17.1339C14.8683 16.8995 15 16.5815 15 16.25V15H16.25C16.5815 15 16.8995 14.8683 17.1339 14.6339C17.3683 14.3995 17.5 14.0815 17.5 13.75V3.75C17.5 3.41848 17.3683 3.10054 17.1339 2.86612C16.8995 2.6317 16.5815 2.5 16.25 2.5ZM6.25 3.75H16.25V9.17031L14.9453 7.86563C14.7109 7.63138 14.3931 7.4998 14.0617 7.4998C13.7303 7.4998 13.4125 7.63138 13.1781 7.86563L7.29453 13.75H6.25V3.75ZM13.75 16.25H3.75V6.25H5V13.75C5 14.0815 5.1317 14.3995 5.36612 14.6339C5.60054 14.8683 5.91848 15 6.25 15H13.75V16.25ZM16.25 13.75H9.0625L14.0625 8.75L16.25 10.9375V13.75ZM9.375 8.75C9.74584 8.75 10.1084 8.64003 10.4167 8.43401C10.725 8.22798 10.9654 7.93514 11.1073 7.59253C11.2492 7.24992 11.2863 6.87292 11.214 6.50921C11.1416 6.14549 10.963 5.8114 10.7008 5.54917C10.4386 5.28695 10.1045 5.10837 9.74079 5.03603C9.37708 4.96368 9.00008 5.00081 8.65747 5.14273C8.31486 5.28464 8.02202 5.52496 7.81599 5.83331C7.60997 6.14165 7.5 6.50416 7.5 6.875C7.5 7.37228 7.69754 7.84919 8.04917 8.20083C8.40081 8.55246 8.87772 8.75 9.375 8.75ZM9.375 6.25C9.49861 6.25 9.61945 6.28666 9.72223 6.35533C9.82501 6.42401 9.90512 6.52162 9.95242 6.63582C9.99973 6.75003 10.0121 6.87569 9.98799 6.99693C9.96388 7.11817 9.90435 7.22953 9.81694 7.31694C9.72953 7.40435 9.61817 7.46388 9.49693 7.48799C9.37569 7.51211 9.25003 7.49973 9.13582 7.45242C9.02162 7.40512 8.92401 7.32501 8.85533 7.22223C8.78666 7.11945 8.75 6.99861 8.75 6.875C8.75 6.70924 8.81585 6.55027 8.93306 6.43306C9.05027 6.31585 9.20924 6.25 9.375 6.25Z" fill="#151515" />
              </svg>
            </Button>
          </div>

          <div className="mt-auto flex h-[112px] w-[44px] flex-col items-center gap-6">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              type="button"
              onClick={(e) => e.preventDefault()}
            >
              <Sparkle className="h-5 w-5" strokeWidth={1.5} />
            </Button>
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex h-[56px] w-[1340px] items-center gap-6 self-center rounded-[16px] bg-background px-6 py-3">
            <div className="flex h-[32px] w-[1292px] items-center justify-between ">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
                <span className="text-sm font-medium text-foreground">Message</span>
              </div>

              <div className="flex h-[32px] w-[476px] items-center justify-between gap-4">
                <div className="flex h-[32px] w-[300px] items-center gap-2 rounded-[10px] border border-[#E8E5DF] bg-background py-[10px] pl-[10px] pr-1">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search"
                    className="h-[16px] w-[214px] border-0 bg-transparent p-0 font-normal leading-4 text-[#8796AF] shadow-none placeholder:text-[#8796AF] focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                  <div className="flex h-[24px] w-[40px] items-center justify-center gap-1 rounded-[6px] bg-[#F3F3EE] px-[6px] py-[5px] text-xs text-muted-foreground">
                    ⌘+K
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-[32px] w-[32px] rounded-[8px] border border-[#E8E5DF] bg-background text-muted-foreground hover:bg-muted/30"
                  >
                    <Bell className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-[32px] w-[32px] rounded-[8px] border border-[#E8E5DF] bg-background text-muted-foreground hover:bg-muted/30"
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                  <div className="h-[20px] w-0 border-l border-[#E8E5DF]" />
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8 bg-[#F7F9FB]">
                      <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                      <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                    </Avatar>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-9 gap-1 px-2 text-muted-foreground"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ChevronDown className="h-[16px] w-[16px]" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex h-full w-full gap-4 overflow-hidden">
            <div className="flex h-[932px] w-[400px] shrink-0 flex-col gap-6 overflow-hidden rounded-[24px] bg-background p-6">
              {section === "chats" ? (
                <ChatList
                  activeChatId={activeChatId}
                  onChatSelect={handleSelectChat}
                  chats={chatData}
                  users={users}
                  currentUserId={currentUser.id}
                  getUserById={getUserById}
                  onNewMessage={handleContactClick}
                  onDeleteChat={handleDeleteChat}
                  onClearChat={handleClearChat}
                  onMarkUnread={handleToggleUnread}
                  archivedChatIds={archivedChatIds}
                  onToggleArchive={handleToggleArchive}
                  onContactInfo={handleOpenContactInfo}
                />
              ) : section === "contacts" ? (
                <ContactsList onContactClick={handleContactClick} users={users} currentUserId={currentUser.id} />
              ) : section === "groups" ? (
                <GroupsList activeGroupId={activeGroupId} onGroupSelect={setActiveGroupId} />
              ) : (
                <div className="flex-1" />
              )}
            </div>

            <div className="flex h-[932px] w-[928px] flex-col overflow-hidden rounded-[24px] bg-white p-3">
              {section === "chats" ? (
                activeChat ? (
                  <ConversationView chat={activeChat} onSendMessage={handleSendMessage} getUserById={getUserById} currentUserId={currentUser.id} />
                ) : (
                  <EmptyChat />
                )
              ) : section === "groups" ? (
                activeGroup ? (
                  <GroupConversation group={activeGroup} onSendMessage={handleSendGroupMessage} />
                ) : (
                  <EmptyChat />
                )
              ) : section === "stories" ? (
                <StoriesView />
              ) : section === "settings" ? (
                <SettingsView onLogout={handleLogout} />
              ) : (
                <EmptyChat />
              )}
            </div>
          </div>
        </div>

        <Sheet open={contactInfoOpen} onOpenChange={setContactInfoOpen}>
          <SheetContent side="right" className="p-0 sm:max-w-md">
            <div className="flex items-center justify-between px-6 py-4">
              <SheetTitle className="text-base font-semibold">Contact Info</SheetTitle>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => setContactInfoOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="px-6 py-5">
              <div className="flex flex-col items-center text-center">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={contactUser?.avatar} alt={contactUser?.name ?? ""} />
                  <AvatarFallback>{contactUser?.name?.[0] ?? "?"}</AvatarFallback>
                </Avatar>
                <div className="mt-3 text-sm font-semibold text-foreground">{contactUser?.name ?? ""}</div>
                <div className="mt-1 text-xs text-muted-foreground">{contactUser?.email ?? ""}</div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <Button variant="outline" className="rounded-xl">
                  <Phone className="h-4 w-4" />
                  Audio
                </Button>
                <Button variant="outline" className="rounded-xl">
                  <Video className="h-4 w-4" />
                  Video
                </Button>
              </div>

              <Tabs defaultValue="media" className="mt-5">
                <TabsList className="w-fit rounded-xl bg-muted/30">
                  <TabsTrigger value="media" className="rounded-lg">Media</TabsTrigger>
                  <TabsTrigger value="link" className="rounded-lg">Link</TabsTrigger>
                  <TabsTrigger value="docs" className="rounded-lg">Docs</TabsTrigger>
                </TabsList>

                <TabsContent value="media">
                  {sharedMedia.length > 0 ? (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {sharedMedia.slice(0, 24).map((src) => (
                        <a
                          key={src}
                          href={src}
                          target="_blank"
                          rel="noreferrer"
                          className="aspect-square overflow-hidden rounded-xl bg-muted"
                        >
                          <img src={src} alt="" className="h-full w-full object-cover" />
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-muted-foreground">No media shared yet.</div>
                  )}
                </TabsContent>

                <TabsContent value="link">
                  {sharedLinks.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {sharedLinks.slice(0, 50).map((href) => (
                        <a
                          key={href}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate rounded-xl border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/30"
                          title={href}
                        >
                          {href}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-muted-foreground">No links shared yet.</div>
                  )}
                </TabsContent>

                <TabsContent value="docs">
                  {sharedDocs.length > 0 ? (
                    <div className="mt-4 space-y-2">
                      {sharedDocs.slice(0, 50).map((href) => (
                        <a
                          key={href}
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="block truncate rounded-xl border bg-background px-3 py-2 text-sm text-foreground hover:bg-muted/30"
                          title={href}
                        >
                          {href}
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-4 text-sm text-muted-foreground">No documents shared yet.</div>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};

export default ChatPage;

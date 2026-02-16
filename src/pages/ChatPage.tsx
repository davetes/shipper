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
  PenSquare,
  Folder,
  Home,
  Image,
  MessageCircle,
  Phone,
  Search,
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
              lastMessageTime: last ? new Date(last.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "",
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
            timestamp: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            type: "text",
          };
          return {
            ...c,
            messages: [...c.messages, newMsg],
            lastMessage: message.text,
            lastMessageTime: newMsg.timestamp,
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
              timestamp: new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
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
    <div className="min-h-screen w-full bg-muted/30 p-4">
      <div className="mx-auto flex w-full max-w-[1400px] gap-4">
        <div className="flex h-[calc(100vh-2rem)] w-[72px] shrink-0 flex-col items-center rounded-2xl bg-muted/30 py-4 shadow-sm">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-12 w-12 rounded-full bg-emerald-600 text-white hover:bg-emerald-700"
              >
                <PenSquare className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" side="right" sideOffset={12} className="w-72 rounded-2xl p-3">
              <button
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                onClick={() => {
                  navigate("/");
                }}
              >
                <ChevronLeft className="h-4 w-4" />
                Go back to dashboard
              </button>
              <button
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                onClick={() => toast({ title: "Rename file" })}
              >
                <Pencil className="h-4 w-4" />
                Rename file
              </button>

              <Separator className="my-2" />

              <div className="px-1">
                <div className="text-sm font-semibold text-foreground">testing2</div>
                <div className="text-xs text-muted-foreground">testing2@gmail.com</div>
              </div>

              <div className="mt-3 rounded-xl border bg-background p-3">
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
                className="mt-2 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                onClick={() => toast({ title: "Win free credits" })}
              >
                <Gift className="h-4 w-4" />
                Win free credits
              </button>
              <button
                className="mt-1 flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                onClick={() => toast({ title: "Theme Style" })}
              >
                <Sparkles className="h-4 w-4" />
                Theme Style
              </button>

              <Separator className="my-2" />

              <button
                className="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-sm hover:bg-muted/50"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </PopoverContent>
          </Popover>

          <div className="mt-8 flex flex-1 flex-col items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              onClick={() => setSection("stories")}
            >
              <Home className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={
                section === "chats"
                  ? "h-11 w-11 rounded-2xl border border-emerald-600 bg-emerald-50 text-foreground hover:bg-emerald-50"
                  : "h-11 w-11 rounded-2xl text-foreground"
              }
              onClick={() => setSection("chats")}
            >
              <MessageCircle className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              onClick={() => setSection("contacts")}
            >
              <Compass className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              onClick={() => setSection("groups")}
            >
              <Folder className="h-5 w-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-2xl text-foreground"
              onClick={() => setSection("stories")}
            >
              <Image className="h-5 w-5" />
            </Button>
          </div>

          <div className="mt-auto flex flex-col items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div className="flex h-14 items-center gap-3 rounded-2xl bg-background px-4 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full border-2 border-muted-foreground/40" />
              <span className="text-sm font-medium text-foreground">Message</span>
            </div>

            <div className="flex flex-1 items-center justify-center px-4">
              <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search" className="h-9 rounded-full bg-muted/40 pl-9" />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">⌘K</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Bell className="h-4 w-4" />
              </Button>
              <div className="h-6 w-px bg-border" />
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
                </Avatar>
                <Button
                  variant="ghost"
                  className="h-9 gap-1 px-2 text-muted-foreground"
                  onClick={() => setSection("settings")}
                >
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          <div className="flex h-[calc(100vh-5.5rem)] w-full gap-4 overflow-hidden">
            <div className="flex h-full w-[360px] shrink-0 flex-col overflow-hidden rounded-2xl bg-background shadow-sm">
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

            <div className="flex h-full flex-1 flex-col overflow-hidden rounded-2xl bg-background shadow-sm">
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
            <Separator />

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
                  <div className="mt-4 space-y-4">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">May</div>
                      <div className="grid grid-cols-4 gap-2">
                        {mediaGallery.slice(0, 7).map((src) => (
                          <div key={src} className="aspect-square overflow-hidden rounded-xl bg-muted">
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">April</div>
                      <div className="grid grid-cols-4 gap-2">
                        {mediaGallery.slice(7, 16).map((src) => (
                          <div key={src} className="aspect-square overflow-hidden rounded-xl bg-muted">
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-2">March</div>
                      <div className="grid grid-cols-4 gap-2">
                        {mediaGallery.slice(16, 24).map((src) => (
                          <div key={src} className="aspect-square overflow-hidden rounded-xl bg-muted">
                            <img src={src} alt="" className="h-full w-full object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="link">
                  <div className="mt-4 text-sm text-muted-foreground">No links yet.</div>
                </TabsContent>

                <TabsContent value="docs">
                  <div className="mt-4 text-sm text-muted-foreground">No documents yet.</div>
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

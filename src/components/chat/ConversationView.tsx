import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Phone, Video, MoreVertical, Search, CheckCheck } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Chat, User } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  chat: Chat;
  onSendMessage: (chatId: string, text: string) => void;
  getUserById: (id: string) => User | undefined;
  currentUserId: string;
}

const ConversationView = ({ chat, onSendMessage, getUserById, currentUserId }: ConversationViewProps) => {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const user = getUserById(chat.userId);

  const scrollToBottom = (behavior: ScrollBehavior) => {
    const root = scrollAreaRef.current;
    if (!root) return;
    const viewport = root.querySelector<HTMLDivElement>("[data-radix-scroll-area-viewport]");
    if (!viewport) return;

    viewport.scrollTo({ top: viewport.scrollHeight, behavior });
  };

  const emojis = [
    "😀",
    "😂",
    "😍",
    "😊",
    "😉",
    "👍",
    "🙏",
    "🔥",
    "🎉",
    "❤️",
    "😢",
    "😡",
  ];

  useEffect(() => {
    scrollToBottom("auto");
  }, [chat.id]);

  useEffect(() => {
    scrollToBottom("smooth");
  }, [chat.messages]);

  const renderItems = useMemo(() => {
    const startOfDayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

    const dayLabel = (d: Date) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thatDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const diffDays = Math.round((today.getTime() - thatDay.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays >= 2 && diffDays <= 6) {
        return d.toLocaleDateString(undefined, { weekday: "long" });
      }
      return d.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    };

    const items: Array<
      | { kind: "divider"; key: string; label: string }
      | { kind: "message"; key: string; msg: (typeof chat.messages)[number] }
    > = [];

    let lastDayKey: string | null = null;
    for (const msg of chat.messages) {
      const dt = new Date(msg.timestamp);
      const thisKey = startOfDayKey(dt);

      if (thisKey !== lastDayKey) {
        items.push({ kind: "divider", key: `day-${thisKey}`, label: dayLabel(dt) });
        lastDayKey = thisKey;
      }

      items.push({ kind: "message", key: msg.id, msg });
    }

    return items;
  }, [chat.messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(chat.id, input.trim());
    setInput("");

    // Simulate typing indicator
    if (chat.userId !== "ai") {
      setTyping(true);
      setTimeout(() => setTyping(false), 2000);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col bg-background min-h-0 overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 flex h-[48px] w-full min-w-0 shrink-0 items-center justify-between gap-3 bg-background pl-3 pr-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex h-10 min-w-0 flex-1 flex-col gap-1">
            <h3 className="font-semibold text-sm text-foreground">{user.name}</h3>
            <p className={cn("text-xs", user.status === "online" ? "text-[#38C793]" : "text-muted-foreground")}>
              {user.status === "online" ? "Online" : user.lastSeen || "Offline"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
            <Search className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
            <Phone className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
            <Video className="w-4 h-4 text-muted-foreground" />
          </Button>
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="mt-2 flex-1 min-h-0 px-1 pb-3">
        <div className="flex h-[800px] w-full min-w-0 min-h-0 flex-col gap-3 rounded-[16px] border-b border-[#E8E5DF] bg-[#F3F3EE] p-3">
          <ScrollArea
            ref={scrollAreaRef}
            className="min-h-0 flex-1 [&_[data-radix-scroll-area-viewport]]:flex [&_[data-radix-scroll-area-viewport]]:flex-col [&_[data-radix-scroll-area-viewport]]:justify-end"
          >
            <div className="flex flex-col gap-3">
          {renderItems.map((item) => {
            if (item.kind === "divider") {
              return (
                <div key={item.key} className="flex items-center justify-center py-1">
                  <div className="rounded-full bg-white/80 px-3 py-1 text-sm font-medium leading-5 tracking-[-0.006em] text-[#596881]">
                    {item.label}
                  </div>
                </div>
              );
            }

            const msg = item.msg;
            const isMine = msg.senderId === currentUserId;

            return (
              <div key={item.key} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn("flex max-w-[70%] flex-col", isMine ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "text-sm",
                      isMine
                        ? "rounded-tl-[12px] rounded-tr-[12px] rounded-br-[4px] rounded-bl-[12px] bg-[#F0FDF4] text-chat-sent-foreground p-3"
                        : "rounded-[12px] bg-white p-3 text-chat-received-foreground"
                    )}
                  >
                    <p>{msg.text}</p>
                  </div>
                  <div
                    className={cn(
                      "text-[10px] text-muted-foreground",
                      isMine
                        ? "mt-1 flex items-center justify-end gap-1"
                        : "flex h-[20px] w-[54px] items-center justify-start gap-[10px] pt-1"
                    )}
                  >
                    {isMine && <CheckCheck className="h-3 w-3" />}
                    <span>
                      {new Date(msg.timestamp)
                        .toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .replace(/\s?(am|pm)\s*$/i, (m) => m.toUpperCase())}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex justify-end">
              <div className="bg-chat-sent rounded-2xl rounded-br-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-chat-sent-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-chat-sent-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-chat-sent-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Input */}
      <div className="px-3 pb-1 shrink-0">
        <div className="flex h-[40px] w-full min-w-0 items-center gap-1 rounded-[100px] border border-[#E8E5DF] bg-white py-3 pl-4 pr-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type any message..."
            className="h-[16px] flex-1 min-w-0 border-0 bg-transparent p-0 text-xs font-normal leading-4 text-[#262626] shadow-none placeholder:text-[#8796AF] focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex h-8 shrink-0 items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="shrink-0 rounded-full px-[10px] py-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M2.91663 5.83332C2.91663 6.91629 3.34683 7.9549 4.11261 8.72068C4.87838 9.48645 5.91699 9.91666 6.99996 9.91666M6.99996 9.91666C8.08293 9.91666 9.12154 9.48645 9.88731 8.72068C10.6531 7.9549 11.0833 6.91629 11.0833 5.83332M6.99996 9.91666V12.25M4.66663 12.25H9.33329M5.24996 2.91666C5.24996 2.45253 5.43433 2.00741 5.76252 1.67922C6.09071 1.35103 6.53583 1.16666 6.99996 1.16666C7.46409 1.16666 7.90921 1.35103 8.2374 1.67922C8.56559 2.00741 8.74996 2.45253 8.74996 2.91666V5.83332C8.74996 6.29745 8.56559 6.74257 8.2374 7.07076C7.90921 7.39895 7.46409 7.58332 6.99996 7.58332C6.53583 7.58332 6.09071 7.39895 5.76252 7.07076C5.43433 6.74257 5.24996 6.29745 5.24996 5.83332V2.91666Z"
                  stroke="#262626"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  type="button"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M5.25 5.25H5.25583M8.75 5.25H8.75583M1.75 7C1.75 7.68944 1.8858 8.37213 2.14963 9.00909C2.41347 9.64605 2.80018 10.2248 3.28769 10.7123C3.7752 11.1998 4.35395 11.5865 4.99091 11.8504C5.62787 12.1142 6.31056 12.25 7 12.25C7.68944 12.25 8.37213 12.1142 9.00909 11.8504C9.64605 11.5865 10.2248 11.1998 10.7123 10.7123C11.1998 10.2248 11.5865 9.64605 11.8504 9.00909C12.1142 8.37213 12.25 7.68944 12.25 7C12.25 6.31056 12.1142 5.62787 11.8504 4.99091C11.5865 4.35395 11.1998 3.7752 10.7123 3.28769C10.2248 2.80018 9.64605 2.41347 9.00909 2.14963C8.37213 1.8858 7.68944 1.75 7 1.75C6.31056 1.75 5.62787 1.8858 4.99091 2.14963C4.35395 2.41347 3.7752 2.80018 3.28769 3.28769C2.80018 3.7752 2.41347 4.35395 2.14963 4.99091C1.8858 5.62787 1.75 6.31056 1.75 7ZM4.66667 7.58333C4.66667 8.20217 4.9125 8.79566 5.35008 9.23325C5.78767 9.67083 6.38116 9.91667 7 9.91667C7.61884 9.91667 8.21233 9.67083 8.64992 9.23325C9.0875 8.79566 9.33333 8.20217 9.33333 7.58333H4.66667Z"
                      stroke="#262626"
                      strokeWidth="1.3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" side="top" className="w-64 rounded-2xl p-2">
                <div className="grid grid-cols-6 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="h-10 w-10 rounded-xl hover:bg-muted/40 text-lg"
                      onClick={() => setInput((prev) => `${prev}${emoji}`)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-8 w-8 shrink-0 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M8.74995 4.0833L4.95828 7.87497C4.72622 8.10703 4.59585 8.42178 4.59585 8.74997C4.59585 9.07816 4.72622 9.39291 4.95828 9.62497C5.19035 9.85703 5.50509 9.98741 5.83328 9.98741C6.16147 9.98741 6.47622 9.85703 6.70828 9.62497L10.4999 5.8333C10.9641 5.36917 11.2248 4.73968 11.2248 4.0833C11.2248 3.42693 10.9641 2.79743 10.4999 2.3333C10.0358 1.86917 9.40633 1.60843 8.74995 1.60843C8.09357 1.60843 7.46408 1.86917 6.99995 2.3333L3.20828 6.12497C2.51209 6.82116 2.12097 7.7654 2.12097 8.74997C2.12097 9.73454 2.51209 10.6788 3.20828 11.375C3.90448 12.0712 4.84872 12.4623 5.83328 12.4623C6.81785 12.4623 7.76209 12.0712 8.45828 11.375L12.2499 7.5833"
                  stroke="#262626"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Button>

            <Button
              onClick={handleSend}
              size="icon"
              className="h-8 w-8 shrink-0 rounded-full bg-[#1E9A80] text-white hover:bg-[#17836e]"
              disabled={!input.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;

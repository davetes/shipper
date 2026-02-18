import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Search, CheckCheck, Mic } from "lucide-react";
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
  const bottomRef = useRef<HTMLDivElement>(null);
  const user = getUserById(chat.userId);

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
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
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
      <div className="sticky top-0 z-20 flex h-[48px] w-[904px] shrink-0 items-center justify-between gap-3 border-b border-[#E8E5DF] bg-background pl-3 pr-3 pt-2">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="h-10 w-10 rounded-full">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            {user.status === "online" && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-online border-2 border-background" />
            )}
          </div>
          <div className="flex h-10 w-[652px] flex-col gap-1">
            <h3 className="font-semibold text-sm text-foreground">{user.name}</h3>
            <p className="text-xs text-muted-foreground">
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
      <div className="flex-1 min-h-0 px-3 pb-3">
        <div className="flex h-[800px] w-[904px] min-h-0 flex-col gap-3 rounded-[16px] border-b border-[#E8E5DF] bg-[#F3F3EE] p-3">
          <ScrollArea className="min-h-0 flex-1">
            <div className="space-y-3 max-w-3xl mx-auto">
          {chat.messages.map((msg) => {
            const isMine = msg.senderId === currentUserId;
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn("flex max-w-[70%] flex-col", isMine ? "items-end" : "items-start")}>
                  <div
                    className={cn(
                      "text-sm",
                      isMine
                        ? "min-h-[40px] min-w-[186px] rounded-tl-[12px] rounded-tr-[12px] rounded-br-[4px] rounded-bl-[12px] bg-[#F0FDF4] text-chat-sent-foreground p-3"
                        : "min-h-[40px] min-w-[91px] rounded-[12px] bg-white p-3 text-chat-received-foreground"
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
      <div className="px-3 pb-3 shrink-0">
        <div className="flex h-[40px] w-[904px] items-center gap-1 rounded-[100px] border border-[#E8E5DF] bg-black py-3 pl-4 pr-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type any message..."
            className="h-[16px] w-[752px] border-0 bg-transparent p-0 text-xs font-normal leading-4 text-[#8796AF] shadow-none placeholder:text-[#8796AF] focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex h-8 w-[128px] items-center justify-end gap-2">
            <Button
              variant="ghost"
              size="icon"
              type="button"
              className="h-8 w-8 shrink-0 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
            >
              <Mic className="h-6 w-6" />
            </Button>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0 rounded-full p-2 text-white/60 hover:bg-white/10 hover:text-white"
                  type="button"
                >
                  <Smile className="h-6 w-6" />
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
              <Paperclip className="h-6 w-6" />
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

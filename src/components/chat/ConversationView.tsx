import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, Phone, Video, MoreVertical, Search } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Chat, getUserById } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ConversationViewProps {
  chat: Chat;
  onSendMessage: (chatId: string, text: string) => void;
}

const ConversationView = ({ chat, onSendMessage }: ConversationViewProps) => {
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const user = getUserById(chat.userId);

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
    <div className="flex-1 flex flex-col bg-background">
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-5 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Avatar className="w-10 h-10">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback>{user.name[0]}</AvatarFallback>
            </Avatar>
            {user.status === "online" && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-online border-2 border-background" />
            )}
          </div>
          <div>
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
      <div className="flex-1 px-5 pb-5">
        <div className="h-full rounded-2xl bg-muted/25 p-4">
          <ScrollArea className="h-full">
            <div className="space-y-3 max-w-3xl mx-auto">
          {chat.messages.map((msg) => {
            const isMine = msg.senderId === "me";
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 text-sm",
                    isMine
                      ? "bg-chat-sent text-chat-sent-foreground rounded-br-md"
                      : "bg-chat-received text-chat-received-foreground rounded-bl-md"
                  )}
                >
                  <p>{msg.text}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    isMine ? "text-chat-sent-foreground/70" : "text-muted-foreground"
                  )}>
                    {msg.timestamp}
                  </p>
                </div>
              </div>
            );
          })}
          {typing && (
            <div className="flex justify-start">
              <div className="bg-chat-received rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
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
      <div className="px-5 pb-5 shrink-0">
        <div className="flex items-center gap-2 rounded-2xl bg-background">
          <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 rounded-xl">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type any message..."
            className="flex-1 h-11 bg-muted/30 border-0 rounded-xl px-4"
          />
          <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0 rounded-xl">
            <Smile className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleSend}
            size="icon"
            className="shrink-0 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConversationView;

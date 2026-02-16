import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Smile, MoreVertical, Users } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Group, getUserById } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface GroupConversationProps {
  group: Group;
  onSendMessage: (groupId: string, text: string) => void;
}

const GroupConversation = ({ group, onSendMessage }: GroupConversationProps) => {
  const [input, setInput] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [group.messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(group.id, input.trim());
    setInput("");
  };

  return (
    <div className="flex-1 flex flex-col bg-background">
      <div className="h-16 border-b border-border flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10">
            <AvatarImage src={group.avatar} alt={group.name} />
            <AvatarFallback>{group.name[0]}</AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm text-foreground">{group.name}</h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" /> {group.members.length} members
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="text-muted-foreground">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3 max-w-3xl mx-auto">
          {group.messages.map((msg) => {
            const isMine = msg.senderId === "me";
            const sender = getUserById(msg.senderId);
            return (
              <div key={msg.id} className={cn("flex", isMine ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[70%]", !isMine && "flex gap-2")}>
                  {!isMine && (
                    <Avatar className="w-7 h-7 mt-1 shrink-0">
                      <AvatarImage src={sender?.avatar} />
                      <AvatarFallback>{sender?.name?.[0]}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      "rounded-2xl px-4 py-2.5 text-sm",
                      isMine
                        ? "bg-chat-sent text-chat-sent-foreground rounded-br-md"
                        : "bg-chat-received text-chat-received-foreground rounded-bl-md"
                    )}
                  >
                    {!isMine && (
                      <p className="text-xs font-semibold text-primary mb-0.5">{sender?.name}</p>
                    )}
                    <p>{msg.text}</p>
                    <p className={cn(
                      "text-[10px] mt-1",
                      isMine ? "text-chat-sent-foreground/70" : "text-muted-foreground"
                    )}>
                      {msg.timestamp}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      </ScrollArea>

      <div className="border-t border-border p-3 shrink-0">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
            <Paperclip className="w-5 h-5" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Type a message..."
            className="flex-1 h-10 bg-secondary border-0 rounded-full px-4"
          />
          <Button variant="ghost" size="icon" className="text-muted-foreground shrink-0">
            <Smile className="w-5 h-5" />
          </Button>
          <Button
            onClick={handleSend}
            size="icon"
            className="shrink-0 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default GroupConversation;

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { chats, getUserById } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ChatListProps {
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
}

const ChatList = ({ activeChatId, onChatSelect }: ChatListProps) => {
  const [search, setSearch] = useState("");

  const filtered = chats.filter((chat) => {
    const user = getUserById(chat.userId);
    return user?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="w-80 border-r border-border flex flex-col bg-background shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Chats</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9 h-9 bg-secondary border-0"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="py-1">
          {filtered.map((chat) => {
            const user = getUserById(chat.userId);
            if (!user) return null;
            return (
              <button
                key={chat.id}
                onClick={() => onChatSelect(chat.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left",
                  activeChatId === chat.id && "bg-accent"
                )}
              >
                <div className="relative">
                  <Avatar className="w-11 h-11">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                  {user.status === "online" && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-online border-2 border-background" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-foreground truncate">{user.name}</span>
                    <span className="text-xs text-muted-foreground shrink-0">{chat.lastMessageTime}</span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-xs text-muted-foreground truncate">{chat.lastMessage}</span>
                    {chat.unreadCount > 0 && (
                      <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0 shrink-0">
                        {chat.unreadCount}
                      </Badge>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;

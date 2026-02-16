import { Search } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { groups } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface GroupsListProps {
  activeGroupId: string | null;
  onGroupSelect: (groupId: string) => void;
}

const GroupsList = ({ activeGroupId, onGroupSelect }: GroupsListProps) => {
  const [search, setSearch] = useState("");

  const filtered = groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="w-80 border-r border-border flex flex-col bg-background shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Groups</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search groups..."
            className="pl-9 h-9 bg-secondary border-0"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="py-1">
          {filtered.map((group) => (
            <button
              key={group.id}
              onClick={() => onGroupSelect(group.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left",
                activeGroupId === group.id && "bg-accent"
              )}
            >
              <Avatar className="w-11 h-11">
                <AvatarImage src={group.avatar} alt={group.name} />
                <AvatarFallback>{group.name[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-foreground truncate">{group.name}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{group.lastMessageTime}</span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-xs text-muted-foreground truncate">{group.lastMessage}</span>
                  {group.unreadCount > 0 && (
                    <Badge className="h-5 min-w-5 flex items-center justify-center text-[10px] bg-primary text-primary-foreground border-0 shrink-0">
                      {group.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default GroupsList;

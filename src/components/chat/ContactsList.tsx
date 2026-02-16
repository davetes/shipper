import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { User } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface ContactsListProps {
  onContactClick: (userId: string) => void;
  users: User[];
  currentUserId: string;
}

const ContactsList = ({ onContactClick, users, currentUserId }: ContactsListProps) => {
  const [search, setSearch] = useState("");

  const filtered = users
    .filter((u) => u.id !== currentUserId)
    .filter((u) => u.name.toLowerCase().includes(search.toLowerCase()));
  const online = filtered.filter((u) => u.status === "online");
  const offline = filtered.filter((u) => u.status === "offline");

  const renderUser = (user: User) => (
    <button
      key={user.id}
      onClick={() => onContactClick(user.id)}
      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-secondary/60 transition-colors text-left"
    >
      <div className="relative">
        <Avatar className="w-11 h-11">
          <AvatarImage src={user.avatar} alt={user.name} />
          <AvatarFallback>{user.name[0]}</AvatarFallback>
        </Avatar>
        <div className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background",
          user.status === "online" ? "bg-online" : "bg-muted-foreground"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <span className="font-medium text-sm text-foreground">{user.name}</span>
        <p className="text-xs text-muted-foreground truncate">
          {user.statusMessage || (user.status === "online" ? "Online" : user.lastSeen || "Offline")}
        </p>
      </div>
    </button>
  );

  return (
    <div className="w-80 border-r border-border flex flex-col bg-background shrink-0">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Contacts</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search contacts..."
            className="pl-9 h-9 bg-secondary border-0"
          />
        </div>
      </div>
      <ScrollArea className="flex-1">
        {online.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">
              Online — {online.length}
            </p>
            {online.map(renderUser)}
          </div>
        )}
        {offline.length > 0 && (
          <div>
            <p className="px-4 pt-3 pb-1 text-xs font-semibold text-muted-foreground uppercase">
              Offline — {offline.length}
            </p>
            {offline.map(renderUser)}
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ContactsList;

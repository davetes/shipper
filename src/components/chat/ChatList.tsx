import { useState } from "react";
import {
  Archive,
  Download,
  Filter,
  Info,
  PencilLine,
  Search,
  Trash2,
  VolumeX,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/use-toast";
import { Chat, User } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { formatRelativeTime } from "@/lib/time";

interface ChatListProps {
  activeChatId: string | null;
  onChatSelect: (chatId: string) => void;
  chats: Chat[];
  users: User[];
  currentUserId: string;
  getUserById: (id: string) => User | undefined;
  onNewMessage: (userId: string) => void;
  onDeleteChat: (chatId: string) => void;
  onClearChat: (chatId: string) => void;
  onMarkUnread: (chatId: string) => void;
  archivedChatIds: Set<string>;
  onToggleArchive: (chatId: string) => void;
  onContactInfo: (userId: string) => void;
}

const ChatList = ({
  activeChatId,
  onChatSelect,
  chats,
  users,
  currentUserId,
  getUserById,
  onNewMessage,
  onDeleteChat,
  onClearChat,
  onMarkUnread,
  archivedChatIds,
  onToggleArchive,
  onContactInfo,
}: ChatListProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = chats.filter((chat) => {
    const user = getUserById(chat.userId);
    return user?.name.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-5">
        <div className="flex h-8 w-[352px] items-center justify-between">
          <h2 className="h-[30px] w-[118px] text-base font-semibold text-[#111625]">All Message</h2>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                size="sm"
                className="h-8 w-[134px] gap-[6px] rounded-[8px] border border-[#1E9A80] bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,#1E9A80,#1E9A80)] p-2 text-white shadow-[inset_0px_1px_0px_1px_#FFFFFF1F] hover:opacity-95"
              >
                <PencilLine className="h-4 w-4" />
                New Message
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              side="bottom"
              className="flex h-[440px] w-[273px] flex-col rounded-[16px] border border-[#E8E5DF] bg-white p-3 shadow-[0_0_24px_0_#0000000F]"
            >
              <div className="flex h-[24px] w-[249px] items-center gap-[10px] text-sm font-semibold text-foreground">New Message</div>
              <Command className="flex-1 rounded-2xl [&_[cmdk-input-wrapper]]:h-[32px] [&_[cmdk-input-wrapper]]:w-[249px] [&_[cmdk-input-wrapper]]:gap-2 [&_[cmdk-input-wrapper]]:rounded-[10px] [&_[cmdk-input-wrapper]]:border [&_[cmdk-input-wrapper]]:border-[#F3F3EE] [&_[cmdk-input-wrapper]]:px-0 [&_[cmdk-input-wrapper]]:py-0 [&_[cmdk-input-wrapper]]:pl-[10px] [&_[cmdk-input-wrapper]]:pr-1 [&_[cmdk-input-wrapper]]:mb-3 [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-b-0 [&_[cmdk-input-wrapper]_svg]:mr-0">
                <CommandInput placeholder="Search name or email" className="h-[16px] py-0 text-xs leading-4" />
                <CommandList className="max-h-80">
                  <CommandEmpty>No results found.</CommandEmpty>
                  {users
                    .filter((u) => u.id !== currentUserId)
                    .map((u) => (
                      <CommandItem
                        key={u.id}
                        value={`${u.name} ${u.email ?? ""}`}
                        onSelect={() => {
                          onNewMessage(u.id);
                          setOpen(false);
                        }}
                        className="h-[44px] w-[249px] cursor-pointer gap-[10px] rounded-[8px] bg-white px-2 py-[6px] hover:bg-[#F3F3EE] data-[selected=true]:bg-[#F3F3EE]"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={u.avatar} alt={u.name} />
                            <AvatarFallback>{u.name[0]}</AvatarFallback>
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-foreground">{u.name}</span>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="mt-4 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in message"
              className="h-10 rounded-xl bg-muted/30 pl-9"
            />
          </div>
          <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl">
            <Filter className="h-4 w-4 text-muted-foreground" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4">
        <div className="px-2 pb-3">
          {filtered.map((chat) => {
            const user = getUserById(chat.userId);
            if (!user) return null;
            const isArchived = archivedChatIds.has(chat.id);
            const isUnread = chat.unreadCount > 0;
            return (
              <ContextMenu key={chat.id}>
                <ContextMenuTrigger asChild>
                  <button
                    onClick={() => onChatSelect(chat.id)}
                    className={cn(
                      "group w-full flex items-center gap-3 rounded-2xl px-3 py-3 hover:bg-muted/40 transition-colors text-left",
                      activeChatId === chat.id && "bg-muted/60"
                    )}
                  >
                    {isUnread && (
                      <div className="shrink-0">
                        <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-white">
                          <span className="h-4 w-4 rounded-full border-2 border-white/70" />
                          <span className="text-[11px] font-medium leading-none">Unread</span>
                        </div>
                      </div>
                    )}

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
                        <span className="text-xs text-muted-foreground shrink-0">{formatRelativeTime(chat.lastMessageTime)}</span>
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

                    {isArchived && (
                      <div className="shrink-0">
                        <div className="flex flex-col items-center justify-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-white">
                          <Archive className="h-4 w-4" />
                          <span className="text-[11px] font-medium leading-none">Archive</span>
                        </div>
                      </div>
                    )}
                  </button>
                </ContextMenuTrigger>

                <ContextMenuContent className="w-56 rounded-2xl p-2">
                  <ContextMenuItem className="rounded-xl" onSelect={() => onMarkUnread(chat.id)}>
                    {isUnread ? "Mark as read" : "Mark as unread"}
                  </ContextMenuItem>
                  <ContextMenuItem className="rounded-xl" onSelect={() => onToggleArchive(chat.id)}>
                    <Archive className="mr-2 h-4 w-4" />
                    {isArchived ? "Unarchive" : "Archive"}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl"
                    onSelect={() => {
                      toast({ title: "Muted" });
                    }}
                  >
                    <VolumeX className="mr-2 h-4 w-4" />
                    Mute
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl"
                    onSelect={() => onContactInfo(chat.userId)}
                  >
                    <Info className="mr-2 h-4 w-4" />
                    Contact info
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl"
                    onSelect={() => {
                      toast({ title: "Exported" });
                    }}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Export chat
                  </ContextMenuItem>

                  <ContextMenuSeparator />

                  <ContextMenuItem className="rounded-xl" onSelect={() => onClearChat(chat.id)}>
                    Clear chat
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl text-destructive focus:text-destructive"
                    onSelect={() => onDeleteChat(chat.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete chat
                  </ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
};

export default ChatList;

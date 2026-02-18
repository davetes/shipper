import { useState } from "react";
import {
  Archive,
  Download,
  Filter,
  Search,
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
                className="relative -left-3 h-8 w-[134px] gap-[6px] rounded-[8px] border border-[#1E9A80] bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0)_100%),linear-gradient(0deg,#1E9A80,#1E9A80)] p-2 text-white shadow-[inset_0px_1px_0px_1px_#FFFFFF1F] hover:opacity-95"
              >
                <svg width="14" height="13" viewBox="0 0 14 13" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.7749 2.02127L10.7749 5.02127M9.6499 10.6463H12.6499M11.1499 9.14627V12.1463M3.6499 12.1463L11.5249 4.27131C11.7219 4.07433 11.8781 3.84048 11.9847 3.58311C12.0914 3.32574 12.1462 3.04989 12.1462 2.77131C12.1462 2.49274 12.0914 2.21689 11.9847 1.95952C11.8781 1.70215 11.7219 1.4683 11.5249 1.27131C11.3279 1.07433 11.0941 0.918076 10.8367 0.81147C10.5793 0.704864 10.3035 0.649994 10.0249 0.649994C9.74633 0.649994 9.47048 0.704864 9.21311 0.81147C8.95574 0.918076 8.72188 1.07433 8.5249 1.27131L0.649902 9.14631V12.1463H3.6499Z"
                    stroke="white"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                New Message
              </Button>
            </PopoverTrigger>
            <PopoverContent
              align="end"
              side="bottom"
              className="flex w-[273px] flex-col rounded-[16px] border border-[#E8E5DF] bg-white p-3 shadow-[0_0_24px_0_#0000000F]"
            >
              <div className="flex h-[24px] w-[249px] items-center gap-[10px] text-sm font-semibold text-foreground">New Message</div>
              <Command className="flex-1 rounded-2xl [&_[cmdk-input-wrapper]]:h-[32px] [&_[cmdk-input-wrapper]]:w-[249px] [&_[cmdk-input-wrapper]]:gap-2 [&_[cmdk-input-wrapper]]:rounded-[10px] [&_[cmdk-input-wrapper]]:border [&_[cmdk-input-wrapper]]:border-[#F3F3EE] [&_[cmdk-input-wrapper]]:px-0 [&_[cmdk-input-wrapper]]:py-0 [&_[cmdk-input-wrapper]]:pl-[10px] [&_[cmdk-input-wrapper]]:pr-1 [&_[cmdk-input-wrapper]]:mb-3 [&_[cmdk-input-wrapper]]:border-b [&_[cmdk-input-wrapper]]:border-b-0 [&_[cmdk-input-wrapper]_svg]:mr-0">
                <CommandInput placeholder="Search name or email" className="h-[16px] py-0 text-xs leading-4" />
                <CommandList>
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

        <div className="relative -left-3 mt-4 flex h-10 w-[352px] items-center gap-4 ">
          <div className="relative h-10 w-[296px] ">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in message"
              className="h-10 w-full rounded-xl bg-muted/30 pl-9"
            />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-[10px] border border-[#E8E5DF] bg-white p-[10px] text-muted-foreground hover:bg-white"
          >
            <Filter className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1 mt-4">
        <div className="px-1 pb-3">
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
                      "group w-full flex items-stretch gap-3 px-0 py-0 transition-colors text-left"
                    )}
                  >
                    {isUnread && (
                      <div className="shrink-0">
                        <div className="flex h-[64px] w-[64px] flex-col items-center justify-center gap-2 rounded-[12px] bg-[#1E9A80] p-3 text-white">
                          <span className="h-4 w-4 rounded-full border-2 border-white/70" />
                          <span className="text-[11px] font-medium leading-none">Unread</span>
                        </div>
                      </div>
                    )}

                    <div
                      className={cn(
                        "flex flex-1 min-w-0 items-center gap-3 rounded-2xl px-0 py-3 hover:bg-muted/40 transition-colors",
                        activeChatId === chat.id && "bg-muted/60"
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
                    </div>

                    {isArchived && (
                      <div className="shrink-0">
                        <div className="flex h-[64px] w-[64px] flex-col items-center justify-center gap-2 rounded-[12px] bg-[#1E9A80] p-3 text-white">
                          <Archive className="h-4 w-4" />
                          <span className="text-[11px] font-medium leading-none">Archive</span>
                        </div>
                      </div>
                    )}
                  </button>
                </ContextMenuTrigger>

                <ContextMenuContent className="h-[264px] w-[200px] rounded-[16px] border border-[#E8E5DF] bg-white p-2 text-sm font-medium leading-5 tracking-[-0.006em] text-[#111625] shadow-[0_0_24px_0_#0000000F]">
                  <ContextMenuItem className="rounded-xl gap-2" onSelect={() => onMarkUnread(chat.id)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2 13.3333L2.86667 10.7333C1.31733 8.44197 1.916 5.4853 4.26667 3.8173C6.61733 2.14997 9.99333 2.28663 12.1633 4.1373C14.3333 5.98863 14.6267 8.9813 12.8493 11.138C11.072 13.2946 7.77267 13.948 5.13333 12.6666L2 13.3333Z"
                        stroke="#111625"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    {isUnread ? "Mark as read" : "Mark as unread"}
                  </ContextMenuItem>
                  <ContextMenuItem className="rounded-xl gap-2" onSelect={() => onToggleArchive(chat.id)}>
                    <Archive className="h-4 w-4" />
                    {isArchived ? "Unarchive" : "Archive"}
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl flex items-center justify-between"
                    onSelect={() => {
                      toast({ title: "Muted" });
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <VolumeX className="h-4 w-4" />
                      Mute
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M6 4L10 8L6 12"
                        stroke="#111625"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl gap-2"
                    onSelect={() => onContactInfo(chat.userId)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M4.11198 12.566C4.27699 12.0168 4.61462 11.5355 5.07481 11.1933C5.535 10.8512 6.09321 10.6665 6.66665 10.6667H9.33331C9.90749 10.6665 10.4664 10.8516 10.9269 11.1945C11.3874 11.5374 11.725 12.0199 11.8893 12.57M2 8C2 8.78793 2.15519 9.56815 2.45672 10.2961C2.75825 11.0241 3.20021 11.6855 3.75736 12.2426C4.31451 12.7998 4.97595 13.2417 5.7039 13.5433C6.43185 13.8448 7.21207 14 8 14C8.78793 14 9.56815 13.8448 10.2961 13.5433C11.0241 13.2417 11.6855 12.7998 12.2426 12.2426C12.7998 11.6855 13.2417 11.0241 13.5433 10.2961C13.8448 9.56815 14 8.78793 14 8C14 7.21207 13.8448 6.43185 13.5433 5.7039C13.2417 4.97595 12.7998 4.31451 12.2426 3.75736C11.6855 3.20021 11.0241 2.75825 10.2961 2.45672C9.56815 2.15519 8.78793 2 8 2C7.21207 2 6.43185 2.15519 5.7039 2.45672C4.97595 2.75825 4.31451 3.20021 3.75736 3.75736C3.20021 4.31451 2.75825 4.97595 2.45672 5.7039C2.15519 6.43185 2 7.21207 2 8ZM6 6.66667C6 7.1971 6.21071 7.70581 6.58579 8.08088C6.96086 8.45595 7.46957 8.66667 8 8.66667C8.53043 8.66667 9.03914 8.45595 9.41421 8.08088C9.78929 7.70581 10 7.1971 10 6.66667C10 6.13623 9.78929 5.62753 9.41421 5.25245C9.03914 4.87738 8.53043 4.66667 8 4.66667C7.46957 4.66667 6.96086 4.87738 6.58579 5.25245C6.21071 5.62753 6 6.13623 6 6.66667Z"
                        stroke="#111625"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Contact info
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl gap-2"
                    onSelect={() => {
                      toast({ title: "Exported" });
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.66675 11.3333V12.6667C2.66675 13.0203 2.80722 13.3594 3.05727 13.6095C3.30732 13.8595 3.64646 14 4.00008 14H12.0001C12.3537 14 12.6928 13.8595 12.9429 13.6095C13.1929 13.3594 13.3334 13.0203 13.3334 12.6667V11.3333M4.66675 6L8.00008 2.66666M8.00008 2.66666L11.3334 6M8.00008 2.66666V10.6667"
                        stroke="#111625"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Export chat
                  </ContextMenuItem>

                  <ContextMenuItem className="rounded-xl gap-2" onSelect={() => onClearChat(chat.id)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12 4L4 12M4 4L12 12"
                        stroke="#111625"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Clear chat
                  </ContextMenuItem>
                  <ContextMenuItem
                    className="rounded-xl gap-2 text-destructive focus:text-destructive"
                    onSelect={() => onDeleteChat(chat.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M2.66675 4.66667H13.3334M6.66675 7.33333V11.3333M9.33341 7.33333V11.3333M3.33341 4.66667L4.00008 12.6667C4.00008 13.0203 4.14056 13.3594 4.39061 13.6095C4.64065 13.8595 4.97979 14 5.33341 14H10.6667C11.0204 14 11.3595 13.8595 11.6096 13.6095C11.8596 13.3594 12.0001 13.0203 12.0001 12.6667L12.6667 4.66667M6.00008 4.66667V2.66667C6.00008 2.48986 6.07032 2.32029 6.19534 2.19526C6.32037 2.07024 6.48994 2 6.66675 2H9.33341C9.51023 2 9.6798 2.07024 9.80482 2.19526C9.92984 2.32029 10.0001 2.48986 10.0001 2.66667V4.66667"
                        stroke="#DF1C41"
                        strokeWidth="1.33333"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
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

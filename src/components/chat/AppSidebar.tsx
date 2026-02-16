import { MessageCircle, Users, UsersRound, CircleDot, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { currentUser } from "@/data/mockData";
import { cn } from "@/lib/utils";

export type Section = "chats" | "contacts" | "groups" | "stories" | "settings";

interface AppSidebarProps {
  activeSection: Section;
  onSectionChange: (section: Section) => void;
  onLogout: () => void;
}

const navItems: { icon: typeof MessageCircle; label: string; section: Section }[] = [
  { icon: MessageCircle, label: "Chats", section: "chats" },
  { icon: Users, label: "Contacts", section: "contacts" },
  { icon: UsersRound, label: "Groups", section: "groups" },
  { icon: CircleDot, label: "Stories", section: "stories" },
  { icon: Settings, label: "Settings", section: "settings" },
];

const AppSidebar = ({ activeSection, onSectionChange, onLogout }: AppSidebarProps) => {
  return (
    <div className="w-[72px] bg-sidebar flex flex-col items-center py-4 shrink-0">
      <div className="w-10 h-10 rounded-xl bg-sidebar-primary flex items-center justify-center mb-8">
        <MessageCircle className="w-5 h-5 text-sidebar-primary-foreground" />
      </div>

      <nav className="flex-1 flex flex-col items-center gap-2">
        {navItems.map(({ icon: Icon, label, section }) => (
          <button
            key={section}
            onClick={() => onSectionChange(section)}
            className={cn(
              "w-11 h-11 rounded-xl flex items-center justify-center transition-colors relative group",
              activeSection === section
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent"
            )}
            title={label}
          >
            <Icon className="w-5 h-5" />
            <span className="absolute left-14 bg-foreground text-background text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity">
              {label}
            </span>
          </button>
        ))}
      </nav>

      <div className="flex flex-col items-center gap-3 mt-auto">
        <button
          onClick={onLogout}
          className="w-11 h-11 rounded-xl flex items-center justify-center text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
          title="Logout"
        >
          <LogOut className="w-5 h-5" />
        </button>
        <Avatar className="w-9 h-9 ring-2 ring-sidebar-primary">
          <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
          <AvatarFallback>{currentUser.name[0]}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default AppSidebar;

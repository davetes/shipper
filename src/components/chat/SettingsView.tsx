import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { currentUser } from "@/data/mockData";
import { Camera, Bell, Moon, Shield, LogOut } from "lucide-react";

interface SettingsViewProps {
  onLogout: () => void;
}

const SettingsView = ({ onLogout }: SettingsViewProps) => {
  return (
    <div className="flex-1 bg-background overflow-auto">
      <div className="max-w-xl mx-auto py-8 px-6">
        <h2 className="text-lg font-semibold text-foreground mb-6">Settings</h2>

        {/* Profile */}
        <div className="flex items-center gap-4 mb-8">
          <div className="relative">
            <Avatar className="w-20 h-20">
              <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
              <AvatarFallback className="text-2xl">{currentUser.name[0]}</AvatarFallback>
            </Avatar>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">{currentUser.name}</h3>
            <p className="text-sm text-muted-foreground">{currentUser.statusMessage}</p>
          </div>
        </div>

        {/* Profile fields */}
        <div className="space-y-4 mb-8">
          <div>
            <Label className="text-foreground">Display Name</Label>
            <Input defaultValue={currentUser.name} className="mt-1.5 bg-secondary border-0" />
          </div>
          <div>
            <Label className="text-foreground">Email</Label>
            <Input defaultValue={currentUser.email} className="mt-1.5 bg-secondary border-0" />
          </div>
          <div>
            <Label className="text-foreground">Status Message</Label>
            <Input defaultValue={currentUser.statusMessage} className="mt-1.5 bg-secondary border-0" />
          </div>
        </div>

        <Separator className="my-6" />

        {/* Settings toggles */}
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Notifications</p>
                <p className="text-xs text-muted-foreground">Receive message notifications</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Moon className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Dark Mode</p>
                <p className="text-xs text-muted-foreground">Toggle dark theme</p>
              </div>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium text-foreground">Privacy</p>
                <p className="text-xs text-muted-foreground">Manage your privacy settings</p>
              </div>
            </div>
            <Switch defaultChecked />
          </div>
        </div>

        <Separator className="my-6" />

        <Button onClick={onLogout} variant="destructive" className="w-full gap-2">
          <LogOut className="w-4 h-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default SettingsView;

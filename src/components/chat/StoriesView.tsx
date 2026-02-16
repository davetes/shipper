import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { stories, getUserById, mediaGallery } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

const StoriesView = () => {
  return (
    <div className="flex-1 flex flex-col bg-background overflow-hidden">
      {/* Stories */}
      <div className="border-b border-border p-4">
        <h2 className="text-lg font-semibold text-foreground mb-4">Stories</h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {/* My story */}
          <div className="flex flex-col items-center gap-1.5 shrink-0">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center border-2 border-dashed border-primary">
              <Plus className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xs text-foreground font-medium">My Story</span>
          </div>
          {stories.map((story) => {
            const user = getUserById(story.userId);
            if (!user) return null;
            return (
              <div key={story.id} className="flex flex-col items-center gap-1.5 shrink-0 cursor-pointer">
                <div className={cn(
                  "w-16 h-16 rounded-full p-0.5",
                  story.viewed ? "bg-muted-foreground/30" : "bg-gradient-to-br from-primary to-primary/60"
                )}>
                  <Avatar className="w-full h-full border-2 border-background">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name[0]}</AvatarFallback>
                  </Avatar>
                </div>
                <span className="text-xs text-foreground truncate max-w-[64px]">{user.name.split(" ")[0]}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Media Gallery */}
      <div className="p-4 flex-1 overflow-auto">
        <h2 className="text-lg font-semibold text-foreground mb-4">Media Gallery</h2>
        <div className="grid grid-cols-3 gap-2">
          {mediaGallery.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden bg-secondary cursor-pointer hover:opacity-80 transition-opacity">
              <img src={url} alt={`Media ${i + 1}`} className="w-full h-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StoriesView;

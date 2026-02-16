import { MessageCircle } from "lucide-react";

const EmptyChat = () => (
  <div className="flex-1 flex items-center justify-center bg-secondary/30">
    <div className="text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <MessageCircle className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1">Select a conversation</h3>
      <p className="text-sm text-muted-foreground">Choose a chat to start messaging</p>
    </div>
  </div>
);

export default EmptyChat;

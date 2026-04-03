import { MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const ChatPage = () => (
  <div className="p-4 md:p-6 max-w-3xl mx-auto">
    <h1 className="text-2xl font-extrabold text-foreground mb-6">Team Chat</h1>
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <MessageSquare size={48} className="text-muted-foreground/30 mb-3" />
        <p className="text-muted-foreground font-medium">Coming Soon</p>
        <p className="text-xs text-muted-foreground/60 mt-1">Team chat will be available in the next update.</p>
      </CardContent>
    </Card>
  </div>
);

export default ChatPage;

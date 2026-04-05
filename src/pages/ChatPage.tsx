import { useEffect, useState, useRef, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  content: string;
  user_id: string | null;
  created_at: string | null;
}

const ChatPage = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchMessages = useCallback(async () => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .order("created_at", { ascending: true })
      .limit(200);
    if (error) {
      toast.error("Failed to load messages");
    } else {
      setMessages(data as Message[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !user) return;
    const { error } = await supabase
      .from("messages")
      .insert({ content: newMsg.trim(), user_id: user.id });
    if (error) {
      toast.error(error.message);
    }
    setNewMsg("");
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
      <h1 className="text-2xl font-extrabold text-foreground mb-4">Team Chat</h1>

      <Card className="flex-1 flex flex-col min-h-0">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare size={18} className="text-primary" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col min-h-0 p-0">
          <ScrollArea className="flex-1 px-4">
            {loading ? (
              <p className="text-muted-foreground text-center py-8">Loading...</p>
            ) : messages.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">No messages yet. Say hello!</p>
            ) : (
              <div className="space-y-3 py-4">
                {messages.map((msg) => {
                  const isOwn = msg.user_id === user?.id;
                  return (
                    <div key={msg.id} className={`flex ${isOwn ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                          isOwn
                            ? "bg-primary text-primary-foreground rounded-br-md"
                            : "bg-muted text-foreground rounded-bl-md"
                        }`}
                      >
                        {!isOwn && (
                          <p className="text-[10px] font-semibold text-muted-foreground mb-0.5">
                            {msg.user_id?.slice(0, 8)}
                          </p>
                        )}
                        <p>{msg.content}</p>
                        <p className={`text-[10px] mt-1 ${isOwn ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                          {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>
            )}
          </ScrollArea>
          <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-border">
            <Input
              placeholder="Type a message..."
              value={newMsg}
              onChange={(e) => setNewMsg(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" size="icon">
              <Send size={16} />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatPage;

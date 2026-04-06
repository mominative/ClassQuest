import { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useNotifications } from "@/hooks/useNotifications";
import { Bell } from "lucide-react";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Task List",
  "/chat": "Team Chat",
};

function formatTime(date: Date): string {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "ClassQuest";
  const { notifications, markAllRead, unreadCount } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const toggleBell = () => {
    if (!open) markAllRead();
    setOpen((v) => !v);
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-13 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-10">
            <SidebarTrigger className="shrink-0" />
            <div className="h-4 w-px bg-border shrink-0" />
            <h2 className="text-sm font-semibold text-foreground truncate flex-1">{title}</h2>

            {/* Bell notification button */}
            <div className="relative shrink-0" ref={ref}>
              <button
                data-testid="button-notifications"
                onClick={toggleBell}
                className="relative flex items-center justify-center h-8 w-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-destructive" />
                )}
              </button>

              {open && (
                <div className="absolute right-0 top-full mt-2 w-72 rounded-lg border border-border bg-card shadow-lg z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-border flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground">Notifications</span>
                    <span className="text-xs text-muted-foreground">{notifications.length} total</span>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                      No notifications yet
                    </div>
                  ) : (
                    <ul className="max-h-64 overflow-y-auto divide-y divide-border">
                      {notifications.map((n) => (
                        <li key={n.id} className="px-3 py-2 hover:bg-muted/50 transition-colors">
                          <p className="text-xs text-foreground leading-snug">{n.message}</p>
                          <p className="text-[10px] text-muted-foreground mt-0.5">{formatTime(n.time)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

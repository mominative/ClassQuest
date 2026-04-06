import { useLocation } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/tasks": "Task List",
  "/chat": "Team Chat",
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const title = pageTitles[location.pathname] ?? "ClassQuest";

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-13 flex items-center gap-3 border-b border-border bg-card/80 backdrop-blur-sm px-4 sticky top-0 z-10">
            <SidebarTrigger className="shrink-0" />
            <div className="h-4 w-px bg-border shrink-0" />
            <h2 className="text-sm font-semibold text-foreground truncate">{title}</h2>
          </header>
          <main className="flex-1 overflow-auto">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}

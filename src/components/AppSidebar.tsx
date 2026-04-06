import { LayoutDashboard, ListTodo, MessageSquare, LogOut, BookOpen, GraduationCap } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useAuth } from "@/hooks/useAuth";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Task List", url: "/tasks", icon: ListTodo },
  { title: "Team Chat", url: "/chat", icon: MessageSquare },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const { user, roleLabel, signOut } = useAuth();

  const isAdmin = roleLabel === "Admin";
  const RoleIcon = isAdmin ? BookOpen : GraduationCap;
  const displayLabel = roleLabel ?? "Member";

  return (
    <Sidebar collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2 py-3">
            {!collapsed && (
              <span className="font-extrabold text-base text-primary tracking-tight">
                ClassQuest
              </span>
            )}
          </SidebarGroupLabel>

          {!collapsed && (
            <div className="mx-2 mb-3 flex items-center gap-2 rounded-lg bg-muted/60 px-3 py-2">
              <RoleIcon size={15} className={isAdmin ? "text-streak" : "text-primary"} />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold truncate text-foreground">{user?.email}</p>
                <p className={`text-[10px] font-medium ${isAdmin ? "text-streak" : "text-primary"}`}>
                  {displayLabel}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-[10px] shrink-0 ${
                  isAdmin
                    ? "border-streak/40 text-streak bg-streak/10"
                    : "border-primary/40 text-primary bg-primary/10"
                }`}
              >
                {displayLabel}
              </Badge>
            </div>
          )}

          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="hover:bg-muted/50"
                      activeClassName="bg-primary/10 text-primary font-semibold"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-2 border-t border-border">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          onClick={signOut}
        >
          <LogOut size={16} className="mr-2 shrink-0" />
          {!collapsed && "Sign Out"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}

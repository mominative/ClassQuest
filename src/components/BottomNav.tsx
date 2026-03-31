import { Home, Upload, Trophy } from "lucide-react";
import { motion } from "framer-motion";

type Tab = "dashboard" | "submit" | "leaderboard";

interface BottomNavProps {
  active: Tab;
  onTabChange: (tab: Tab) => void;
}

const tabs: { id: Tab; icon: typeof Home; label: string }[] = [
  { id: "dashboard", icon: Home, label: "Home" },
  { id: "submit", icon: Upload, label: "Submit" },
  { id: "leaderboard", icon: Trophy, label: "Rankings" },
];

const BottomNav = ({ active, onTabChange }: BottomNavProps) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 px-4 pb-safe">
      <div className="flex items-center justify-around max-w-md mx-auto py-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center gap-0.5 px-4 py-2 transition-colors"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full gradient-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <tab.icon
                size={22}
                className={isActive ? "text-primary" : "text-muted-foreground"}
              />
              <span
                className={`text-[11px] font-semibold ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import DashboardScreen from "@/screens/DashboardScreen";
import SubmitScreen from "@/screens/SubmitScreen";
import LeaderboardScreen from "@/screens/LeaderboardScreen";
import { AnimatePresence, motion } from "framer-motion";

type Tab = "dashboard" | "submit" | "leaderboard";

const screens: Record<Tab, React.FC<{ onOpenAssignment?: () => void }>> = {
  dashboard: DashboardScreen,
  submit: SubmitScreen,
  leaderboard: LeaderboardScreen,
};

const Index = () => {
  const [tab, setTab] = useState<Tab>("dashboard");

  const Screen = screens[tab];

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <Screen onOpenAssignment={() => setTab("submit")} />
        </motion.div>
      </AnimatePresence>
      <BottomNav active={tab} onTabChange={setTab} />
    </div>
  );
};

export default Index;

import { Flame, Zap, Target, Star } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import AssignmentCard from "@/components/AssignmentCard";

interface DashboardScreenProps {
  onOpenAssignment?: () => void;
}

const assignments = [
  { title: "Fractions & Decimals Quiz", subject: "Math", dueDate: "Tomorrow", xpReward: 50, progress: 60 },
  { title: "Photosynthesis Report", subject: "Science", dueDate: "Mar 28", xpReward: 80, progress: 20 },
  { title: "Book Review: Wonder", subject: "English", dueDate: "Apr 2", xpReward: 65, progress: 0 },
  { title: "Ancient Rome Timeline", subject: "History", dueDate: "Apr 5", xpReward: 70, progress: 45 },
];

const weekDays = ["M", "T", "W", "T", "F", "S", "S"];
const streakDays = [true, true, true, true, true, false, false];

const DashboardScreen = ({ onOpenAssignment }: DashboardScreenProps) => (
  <div className="px-4 pt-6 pb-28 max-w-md mx-auto">
    {/* Header */}
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between mb-6"
    >
      <div>
        <p className="text-sm text-muted-foreground font-medium">Good morning 👋</p>
        <h1 className="text-2xl font-extrabold text-foreground">Alex</h1>
      </div>
      <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
        A
      </div>
    </motion.div>

    {/* Stats Grid */}
    <div className="grid grid-cols-3 gap-3 mb-6">
      <StatCard icon={Zap} label="Total XP" value="2,450" gradient="gradient-xp" />
      <StatCard icon={Flame} label="Day Streak" value="5" gradient="gradient-streak" />
      <StatCard icon={Target} label="Completed" value="12" gradient="gradient-success" />
    </div>

    {/* Streak Calendar */}
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-card rounded-2xl p-4 mb-6"
    >
      <div className="flex items-center gap-2 mb-3">
        <Flame size={16} className="text-streak" />
        <h2 className="font-bold text-sm text-foreground">This Week</h2>
      </div>
      <div className="flex justify-between">
        {weekDays.map((day, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <span className="text-[10px] font-semibold text-muted-foreground">{day}</span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                streakDays[i]
                  ? "gradient-streak"
                  : "bg-muted"
              }`}
            >
              {streakDays[i] && <Star size={14} className="text-streak-foreground" />}
            </div>
          </div>
        ))}
      </div>
    </motion.div>

    {/* Assignments */}
    <div className="mb-4 flex items-center justify-between">
      <h2 className="font-bold text-foreground">Assignments</h2>
      <span className="text-xs font-semibold text-primary">{assignments.length} pending</span>
    </div>
    <div className="flex flex-col gap-3">
      {assignments.map((a, i) => (
        <AssignmentCard key={i} {...a} onClick={onOpenAssignment} />
      ))}
    </div>
  </div>
);

export default DashboardScreen;

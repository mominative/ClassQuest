import { Clock, BookOpen, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

interface AssignmentCardProps {
  title: string;
  subject: string;
  dueDate: string;
  xpReward: number;
  progress: number;
  onClick?: () => void;
}

const subjectColors: Record<string, string> = {
  Math: "bg-primary/10 text-primary",
  Science: "bg-secondary/10 text-secondary",
  English: "bg-accent/10 text-accent",
  History: "bg-streak/10 text-streak",
};

const AssignmentCard = ({ title, subject, dueDate, xpReward, progress, onClick }: AssignmentCardProps) => (
  <motion.button
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="w-full glass-card rounded-2xl p-4 text-left flex items-center gap-3"
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${subjectColors[subject] || "bg-muted text-foreground"}`}>
      <BookOpen size={18} />
    </div>
    <div className="flex-1 min-w-0">
      <h3 className="font-semibold text-sm text-foreground truncate">{title}</h3>
      <div className="flex items-center gap-2 mt-1">
        <span className="text-[11px] font-medium text-muted-foreground flex items-center gap-1">
          <Clock size={11} /> {dueDate}
        </span>
        <span className="text-[11px] font-bold text-xp">+{xpReward} XP</span>
      </div>
      <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full gradient-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
    <ChevronRight size={16} className="text-muted-foreground shrink-0" />
  </motion.button>
);

export default AssignmentCard;

import { Trophy, Medal, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

const leaderboardData = [
  { name: "Maya S.", xp: 3250, avatar: "M", streak: 12 },
  { name: "Ethan R.", xp: 2980, avatar: "E", streak: 8 },
  { name: "Alex W.", xp: 2450, avatar: "A", streak: 5, isYou: true },
  { name: "Sophia L.", xp: 2310, avatar: "S", streak: 7 },
  { name: "Liam K.", xp: 2100, avatar: "L", streak: 3 },
  { name: "Olivia P.", xp: 1980, avatar: "O", streak: 6 },
  { name: "Noah B.", xp: 1850, avatar: "N", streak: 4 },
  { name: "Ava C.", xp: 1720, avatar: "A", streak: 2 },
];

const rankColors = ["gradient-streak", "bg-rank-silver", "bg-rank-bronze"];
const rankIcons = [Trophy, Medal, Medal];

const LeaderboardScreen = () => (
  <div className="px-4 pt-6 pb-28 max-w-md mx-auto">
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-2xl font-extrabold text-foreground mb-1">Leaderboard</h1>
      <p className="text-sm text-muted-foreground mb-6">Class rankings this week</p>
    </motion.div>

    {/* Top 3 Podium */}
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="flex items-end justify-center gap-3 mb-8"
    >
      {[1, 0, 2].map((idx) => {
        const student = leaderboardData[idx];
        const isFirst = idx === 0;
        return (
          <div key={idx} className="flex flex-col items-center">
            <div
              className={`${
                isFirst ? "w-16 h-16" : "w-13 h-13"
              } rounded-full ${rankColors[idx]} flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg ${
                isFirst ? "ring-4 ring-streak/30" : ""
              }`}
              style={{ width: isFirst ? 64 : 52, height: isFirst ? 64 : 52 }}
            >
              {student.avatar}
            </div>
            <span className="font-bold text-xs text-foreground mt-2">{student.name}</span>
            <span className="text-[11px] font-semibold text-xp">{student.xp.toLocaleString()} XP</span>
            <div
              className={`mt-2 rounded-t-lg ${rankColors[idx]} flex items-center justify-center text-primary-foreground font-extrabold text-sm`}
              style={{
                width: 48,
                height: isFirst ? 72 : idx === 1 ? 56 : 40,
              }}
            >
              #{idx + 1}
            </div>
          </div>
        );
      })}
    </motion.div>

    {/* Rest of list */}
    <div className="space-y-2">
      {leaderboardData.slice(3).map((student, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 + i * 0.05 }}
          className={`glass-card rounded-xl p-3 flex items-center gap-3 ${
            student.isYou ? "ring-2 ring-primary/40" : ""
          }`}
        >
          <span className="w-7 text-center font-bold text-sm text-muted-foreground">
            {i + 4}
          </span>
          <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center font-bold text-sm text-foreground">
            {student.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm text-foreground truncate">{student.name}</span>
              {student.isYou && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">YOU</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] font-semibold text-xp">{student.xp.toLocaleString()} XP</span>
              <span className="text-[11px] text-muted-foreground flex items-center gap-0.5">
                <TrendingUp size={10} /> {student.streak}d streak
              </span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  </div>
);

export default LeaderboardScreen;

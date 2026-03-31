import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  gradient: string;
}

const StatCard = ({ icon: Icon, label, value, gradient }: StatCardProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    className={`${gradient} rounded-2xl p-4 text-primary-foreground flex flex-col gap-1 shadow-lg`}
  >
    <Icon size={20} className="opacity-90" />
    <span className="text-2xl font-extrabold leading-none mt-1">{value}</span>
    <span className="text-xs font-medium opacity-80">{label}</span>
  </motion.div>
);

export default StatCard;

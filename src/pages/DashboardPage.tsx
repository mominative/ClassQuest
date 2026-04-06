import { useTasks } from "@/hooks/useTasks";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart";
import { PieChart, Pie, Cell } from "recharts";
import { ListTodo, Clock, CheckCircle2, Star, Zap, Flame, PieChart as PieChartIcon } from "lucide-react";
import { Progress } from "@/components/ui/progress";

const XP_PER_LEVEL = 500;

const pieChartConfig = {
  completed: { label: "Completed", color: "hsl(var(--success))" },
  pending: { label: "Pending", color: "hsl(var(--primary))" },
};

const DashboardPage = () => {
  const { tasks, loading } = useTasks();
  const { profile, loading: profileLoading } = useProfile();
  const { roleLabel } = useAuth();

  const completed = tasks.filter((t) => t.status === "done").length;
  const pending = tasks.filter((t) => t.status !== "done").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const todo = tasks.filter((t) => t.status === "todo").length;

  const pieData = [
    { name: "completed", value: completed },
    { name: "pending", value: pending },
  ];

  const totalXp = profile?.total_xp ?? 0;
  const level = profile?.current_level ?? 1;
  const streak = profile?.daily_streak ?? 0;
  const xpInLevel = totalXp % XP_PER_LEVEL;
  const xpProgress = (xpInLevel / XP_PER_LEVEL) * 100;

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        Loading...
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>
        <span className="text-sm text-muted-foreground font-medium">
          Signed in as{" "}
          <span className="text-primary font-semibold">{roleLabel}</span>
        </span>
      </div>

      {/* XP & Level Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="gradient-xp text-primary-foreground">
          <CardContent className="p-4 flex items-center gap-3">
            <Star size={24} />
            <div className="flex-1">
              <p className="text-2xl font-bold">{totalXp}</p>
              <p className="text-xs opacity-80">Total XP</p>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-primary text-primary-foreground">
          <CardContent className="p-4 flex items-center gap-3">
            <Zap size={24} />
            <div className="flex-1">
              <p className="text-2xl font-bold">Level {level}</p>
              <Progress
                value={xpProgress}
                className="h-2 mt-1 bg-primary-foreground/20"
              />
              <p className="text-[10px] opacity-70 mt-0.5">
                {xpInLevel}/{XP_PER_LEVEL} XP to next
              </p>
            </div>
          </CardContent>
        </Card>
        <Card className="gradient-streak text-primary-foreground">
          <CardContent className="p-4 flex items-center gap-3">
            <Flame size={24} />
            <div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs opacity-80">Day Streak</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick stat tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Tasks", value: tasks.length, icon: ListTodo, color: "text-foreground" },
          { label: "To Do", value: todo, icon: Clock, color: "text-primary" },
          { label: "In Progress", value: inProgress, icon: PieChartIcon, color: "text-streak" },
          { label: "Completed", value: completed, icon: CheckCircle2, color: "text-success" },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon size={22} className={s.color} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pie Chart — Completed vs Pending */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <PieChartIcon size={18} className="text-primary" />
            Completed vs Pending Tasks
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          {tasks.length === 0 ? (
            <p className="text-muted-foreground py-12">No tasks yet — add some from the Task List.</p>
          ) : (
            <ChartContainer config={pieChartConfig} className="h-[280px] w-full max-w-sm">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  <Cell fill="hsl(var(--success))" stroke="transparent" />
                  <Cell fill="hsl(var(--primary))" stroke="transparent" />
                </Pie>
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          )}

          {tasks.length > 0 && (
            <div className="mt-2 flex gap-8 text-center">
              <div>
                <p className="text-2xl font-bold text-success">{completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Complete Rate</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

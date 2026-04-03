import { useTasks, TaskStatus } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts";
import { BarChart3, ListTodo, Clock, CheckCircle2 } from "lucide-react";

const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const statusColors: Record<TaskStatus, string> = {
  todo: "hsl(var(--primary))",
  in_progress: "hsl(var(--streak))",
  done: "hsl(var(--success))",
};

const chartConfig = {
  count: { label: "Tasks" },
  todo: { label: "Todo", color: "hsl(var(--primary))" },
  in_progress: { label: "In Progress", color: "hsl(var(--streak))" },
  done: { label: "Done", color: "hsl(var(--success))" },
};

const DashboardPage = () => {
  const { tasks, loading } = useTasks();

  const counts: Record<TaskStatus, number> = { todo: 0, in_progress: 0, done: 0 };
  tasks.forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });

  const chartData = (["todo", "in_progress", "done"] as TaskStatus[]).map((s) => ({
    status: statusLabels[s],
    count: counts[s],
    key: s,
  }));

  const statCards = [
    { label: "Total", value: tasks.length, icon: ListTodo, color: "text-primary" },
    { label: "Todo", value: counts.todo, icon: Clock, color: "text-primary" },
    { label: "In Progress", value: counts.in_progress, icon: BarChart3, color: "text-streak" },
    { label: "Done", value: counts.done, icon: CheckCircle2, color: "text-success" },
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-64 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {statCards.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <s.icon size={20} className={s.color} />
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BarChart3 size={18} className="text-primary" />
            Task Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[250px] w-full">
            <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: -10 }}>
              <XAxis dataKey="status" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.key} fill={statusColors[entry.key]} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;

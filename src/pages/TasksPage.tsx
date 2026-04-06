import { useState, useMemo } from "react";
import { useTasks, Task, TaskStatus } from "@/hooks/useTasks";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Trash2, Edit2, Check, X, Search, ListTodo, ArrowUpDown, Star, Calendar } from "lucide-react";

const statusLabels: Record<TaskStatus, string> = {
  todo: "Todo",
  in_progress: "In Progress",
  done: "Done",
};

const statusVariant: Record<TaskStatus, "default" | "secondary" | "destructive" | "outline"> = {
  todo: "outline",
  in_progress: "secondary",
  done: "default",
};

function TaskDetailModal({ task, onClose }: { task: Task; onClose: () => void }) {
  const createdDate = new Date(task.created_at).toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const createdTime = new Date(task.created_at).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md" data-testid="modal-task-detail">
        <DialogHeader>
          <DialogTitle className="text-base leading-snug pr-6">{task.title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-1">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">Status</span>
            <Badge variant={statusVariant[task.status]}>{statusLabels[task.status]}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">XP Reward</span>
            <span className="flex items-center gap-1 text-sm font-semibold text-primary">
              <Star size={14} />
              {task.xp_reward ?? 50} XP
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0 mt-0.5">Created</span>
            <span className="flex items-start gap-1 text-sm text-foreground">
              <Calendar size={14} className="mt-0.5 shrink-0" />
              <span>
                {createdDate}
                <br />
                <span className="text-xs text-muted-foreground">{createdTime}</span>
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-20 shrink-0">Priority</span>
            <Badge variant={task.status === "todo" ? "destructive" : "outline"}>
              {task.status === "todo" ? "High" : task.status === "in_progress" ? "Medium" : "Low"}
            </Badge>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

const TasksPage = () => {
  const { tasks, loading, addTask, updateTask, deleteTask, canModify, canEditAllTasks } = useTasks();
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [sortDate, setSortDate] = useState<"newest" | "oldest">("newest");
  const [previewTask, setPreviewTask] = useState<Task | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addTask(newTask);
    setNewTask("");
  };

  const handleSave = async (id: string) => {
    if (!editTitle.trim()) return;
    await updateTask(id, { title: editTitle.trim() });
    setEditingId(null);
  };

  const filtered = useMemo(() => {
    const list = tasks.filter((t) => {
      // Status filter
      if (filterStatus === "pending" && t.status === "done") return false;
      if (filterStatus === "completed" && t.status !== "done") return false;
      if (filterStatus !== "all" && filterStatus !== "pending" && filterStatus !== "completed" && t.status !== filterStatus) return false;

      // Priority filter: high = todo, medium = in_progress, low = done
      if (filterPriority === "high" && t.status !== "todo") return false;
      if (filterPriority === "low" && t.status === "todo") return false;

      // Search
      if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;

      return true;
    });
    list.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sortDate === "newest" ? -diff : diff;
    });
    return list;
  }, [tasks, filterStatus, filterPriority, search, sortDate]);

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-extrabold text-foreground">
        {canEditAllTasks ? "All Tasks (Admin)" : "My Tasks"}
      </h1>

      {/* Add task */}
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleAdd} className="flex gap-2">
            <Input
              placeholder="Add a new task..."
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              className="flex-1"
              data-testid="input-new-task"
            />
            <Button type="submit" size="sm">
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[160px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>

        {/* Status filter */}
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-filter-status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        {/* Priority filter */}
        <Select value={filterPriority} onValueChange={setFilterPriority}>
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-filter-priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="high">High Priority</SelectItem>
            <SelectItem value="low">Low Priority</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortDate} onValueChange={(v) => setSortDate(v as "newest" | "oldest")}>
          <SelectTrigger className="w-full sm:w-[150px]" data-testid="select-sort-date">
            <ArrowUpDown size={14} className="mr-1 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Sort by date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="oldest">Oldest First</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task list */}
      {loading ? (
        <p className="text-muted-foreground text-center py-8">Loading tasks...</p>
      ) : filtered.length === 0 ? (
        <div className="text-center py-8">
          <ListTodo size={40} className="mx-auto mb-2 text-muted-foreground/40" />
          <p className="text-muted-foreground">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <Card key={task.id} className="group" data-testid={`card-task-${task.id}`}>
              <CardContent className="p-3 flex items-center gap-3">
                {editingId === task.id ? (
                  <>
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 h-8 text-sm"
                      autoFocus
                      onKeyDown={(e) => e.key === "Enter" && handleSave(task.id)}
                    />
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleSave(task.id)}>
                      <Check size={14} className="text-success" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}>
                      <X size={14} />
                    </Button>
                  </>
                ) : (
                  <>
                    {/* Clickable title opens quick-view modal */}
                    <button
                      data-testid={`button-task-title-${task.id}`}
                      onClick={() => setPreviewTask(task)}
                      className={`flex-1 text-sm text-left hover:text-primary transition-colors cursor-pointer ${
                        task.status === "done" ? "line-through opacity-60" : "text-foreground"
                      }`}
                    >
                      {task.title}
                    </button>

                    <Select
                      value={task.status}
                      onValueChange={(v) => updateTask(task.id, { status: v as TaskStatus })}
                      disabled={!canModify(task)}
                    >
                      <SelectTrigger className="h-7 w-[120px] text-xs">
                        <Badge variant={statusVariant[task.status]} className="text-[10px]">
                          {statusLabels[task.status]}
                        </Badge>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">Todo</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="done">Done</SelectItem>
                      </SelectContent>
                    </Select>

                    {canModify(task) && (
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          data-testid={`button-edit-${task.id}`}
                          onClick={() => { setEditingId(task.id); setEditTitle(task.title); }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          data-testid={`button-delete-${task.id}`}
                          onClick={() => deleteTask(task.id)}
                        >
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Task Quick View Modal */}
      {previewTask && (
        <TaskDetailModal task={previewTask} onClose={() => setPreviewTask(null)} />
      )}
    </div>
  );
};

export default TasksPage;

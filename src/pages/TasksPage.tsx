import { useState } from "react";
import { useTasks, TaskStatus } from "@/hooks/useTasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit2, Check, X, Search, ListTodo } from "lucide-react";

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

const TasksPage = () => {
  const { tasks, loading, addTask, updateTask, deleteTask, canModify, role } = useTasks();
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

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

  const filtered = tasks.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-extrabold text-foreground">
        {role === "admin" ? "All Tasks" : "My Tasks"}
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
            />
            <Button type="submit" size="sm">
              <Plus size={16} className="mr-1" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="todo">Todo</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="done">Done</SelectItem>
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
            <Card key={task.id} className="group">
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
                    <span className={`flex-1 text-sm text-foreground ${task.status === "done" ? "line-through opacity-60" : ""}`}>
                      {task.title}
                    </span>

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
                          onClick={() => { setEditingId(task.id); setEditTitle(task.title); }}
                        >
                          <Edit2 size={14} />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => deleteTask(task.id)}>
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
    </div>
  );
};

export default TasksPage;

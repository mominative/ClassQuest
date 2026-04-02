import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Trash2, LogOut, Shield, CheckSquare, Edit2, Check, X } from "lucide-react";

interface Task {
  id: string;
  title: string;
  user_id: string;
}

const Dashboard = () => {
  const { user, role, signOut } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("Tasks")
      .select("*")
      .order("id", { ascending: false });
    if (error) {
      toast.error("Failed to load tasks");
    } else {
      setTasks(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim() || !user) return;
    const { error } = await supabase
      .from("Tasks")
      .insert({ title: newTask.trim(), user_id: user.id });
    if (error) {
      toast.error(error.message);
    } else {
      setNewTask("");
      fetchTasks();
      toast.success("Task added!");
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("Tasks").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      fetchTasks();
      toast.success("Task deleted");
    }
  };

  const startEdit = (task: Task) => {
    setEditingId(task.id);
    setEditTitle(task.title);
  };

  const saveEdit = async (id: string) => {
    if (!editTitle.trim()) return;
    const { error } = await supabase
      .from("Tasks")
      .update({ title: editTitle.trim() })
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      setEditingId(null);
      fetchTasks();
      toast.success("Task updated");
    }
  };

  const canModify = (task: Task) => role === "admin" || task.user_id === user?.id;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-foreground">ClassQuest</h1>
            {role === "admin" && (
              <span className="flex items-center gap-1 text-xs font-semibold bg-accent/15 text-accent px-2 py-0.5 rounded-full">
                <Shield size={12} /> Admin
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:block">
              {user?.email}
            </span>
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut size={18} />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Add task */}
        <Card className="mb-6">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckSquare size={18} className="text-primary" />
              {role === "admin" ? "All Tasks" : "My Tasks"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addTask} className="flex gap-2">
              <Input
                placeholder="Add a new task..."
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                className="flex-1"
              />
              <Button type="submit" size="sm">
                <Plus size={16} /> Add
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Task list */}
        {loading ? (
          <p className="text-muted-foreground text-center py-8">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No tasks yet. Create your first one!</p>
        ) : (
          <div className="space-y-2">
            {tasks.map((task) => (
              <Card key={task.id} className="group">
                <CardContent className="p-3 flex items-center gap-3">
                  {editingId === task.id ? (
                    <>
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="flex-1 h-8 text-sm"
                        autoFocus
                        onKeyDown={(e) => e.key === "Enter" && saveEdit(task.id)}
                      />
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => saveEdit(task.id)}>
                        <Check size={14} className="text-success" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setEditingId(null)}>
                        <X size={14} />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span className="flex-1 text-sm text-foreground">{task.title}</span>
                      {role === "admin" && task.user_id !== user?.id && (
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          other user
                        </span>
                      )}
                      {canModify(task) && (
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => startEdit(task)}>
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
      </main>
    </div>
  );
};

export default Dashboard;

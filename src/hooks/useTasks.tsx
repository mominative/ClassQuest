import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export type TaskStatus = "todo" | "in_progress" | "done";

export interface Task {
  id: string;
  title: string;
  user_id: string;
  status: TaskStatus;
  created_at: string;
}

export function useTasks() {
  const { user, role } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    const { data, error } = await supabase
      .from("Tasks")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load tasks");
    } else {
      setTasks((data as Task[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchTasks();

    // Real-time subscription
    const channel = supabase
      .channel("tasks-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Tasks" },
        () => {
          fetchTasks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTasks]);

  const addTask = async (title: string) => {
    if (!title.trim() || !user) return;
    const { error } = await supabase
      .from("Tasks")
      .insert({ title: title.trim(), user_id: user.id, status: "todo" as TaskStatus });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Task added!");
    }
  };

  const updateTask = async (id: string, updates: Partial<Pick<Task, "title" | "status">>) => {
    const { error } = await supabase.from("Tasks").update(updates).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Task updated");
    }
  };

  const deleteTask = async (id: string) => {
    const { error } = await supabase.from("Tasks").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Task deleted");
    }
  };

  const canModify = (task: Task) => role === "admin" || task.user_id === user?.id;

  return { tasks, loading, addTask, updateTask, deleteTask, canModify, role };
}

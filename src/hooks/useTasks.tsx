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
  xp_reward: number | null;
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
      return;
    }
    toast.success("Task updated");

    // When marking a task as done, create a submission and award XP
    if (updates.status === "done" && user) {
      const task = tasks.find((t) => t.id === id);
      const xpReward = (task as any)?.xp_reward ?? 50;

      // Insert submission
      await supabase.from("submissions").insert({
        task_id: id,
        user_id: user.id,
        status: "completed",
      });

      // Award XP to profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_xp, current_level")
        .eq("id", user.id)
        .single();

      if (profile) {
        const newXp = (profile.total_xp ?? 0) + xpReward;
        const newLevel = Math.floor(newXp / 500) + 1;
        await supabase.from("profiles").update({
          total_xp: newXp,
          current_level: newLevel,
        }).eq("id", user.id);
        toast.success(`+${xpReward} XP earned!`);
      }
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

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertSubmission } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useUpdateTaskStatus } from "./use-tasks";

export function useSubmissions(taskId?: string) {
  const params = taskId ? `?taskId=${taskId}` : "";

  return useQuery({
    queryKey: [api.submissions.list.path, taskId],
    queryFn: async () => {
      const res = await fetch(api.submissions.list.path + params);
      if (!res.ok) throw new Error("Failed to fetch submissions");
      return api.submissions.list.responses[200].parse(await res.json());
    },
    enabled: !!taskId,
  });
}

export function useCreateSubmission() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const updateTask = useUpdateTaskStatus();

  return useMutation({
    mutationFn: async (data: InsertSubmission) => {
      const res = await fetch(api.submissions.create.path, {
        method: api.submissions.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to submit proof");
      return api.submissions.create.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.submissions.list.path] });
      
      // Auto-complete the task when submission is made
      updateTask.mutate({ id: data.taskId, status: "completed" });
      
      toast({ title: "Success", description: "Proof submitted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to submit proof", variant: "destructive" });
    },
  });
}

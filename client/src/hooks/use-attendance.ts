import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { InsertAttendance } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function useAttendance(candidateId?: string) {
  const params = candidateId ? `?candidateId=${candidateId}` : "";

  return useQuery({
    queryKey: [api.attendance.list.path, candidateId],
    queryFn: async () => {
      const res = await fetch(api.attendance.list.path + params);
      if (!res.ok) throw new Error("Failed to fetch attendance records");
      return api.attendance.list.responses[200].parse(await res.json());
    },
  });
}

export function useMarkAttendance() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertAttendance) => {
      const res = await fetch(api.attendance.mark.path, {
        method: api.attendance.mark.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to mark attendance");
      return api.attendance.mark.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.attendance.list.path] });
      toast({ title: "Marked!", description: "Attendance recorded with live photo." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to mark attendance", variant: "destructive" });
    },
  });
}

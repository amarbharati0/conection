import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useCandidates() {
  return useQuery({
    queryKey: [api.candidates.list.path],
    queryFn: async () => {
      const res = await fetch(api.candidates.list.path);
      if (!res.ok) throw new Error("Failed to fetch candidates");
      return api.candidates.list.responses[200].parse(await res.json());
    },
  });
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Task, 
  TaskStatus, 
  User
} from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Plus, Clock, User as UserIcon, CheckCircle2, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { apiRequest } from "@/lib/queryClient";

export default function TaskManagement() {
  const { toast } = useToast();
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: candidates = [] } = useQuery<User[]>({
    queryKey: ["/api/candidates"],
  });

  const createTaskMutation = useMutation({
    mutationFn: async (values: any) => {
      const res = await apiRequest("POST", "/api/tasks", values);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task created successfully" });
      setIsCreateOpen(false);
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, updates);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
      toast({ title: "Task updated successfully" });
    },
  });

  const form = useForm({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      title: "",
      description: "",
      assignedTo: "",
      deadline: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    },
  });

  const onSubmit = (values: any) => {
    createTaskMutation.mutate(values);
  };

  const tasksByStatus = {
    pending: tasks.filter((t) => t.status === "pending"),
    submitted: tasks.filter((t) => t.status === "submitted"),
    completed: tasks.filter((t) => t.status === "completed"),
  };

  const StatusColumn = ({ title, status, tasks, color }: { title: string; status: TaskStatus; tasks: Task[]; color: string }) => (
    <div className="flex flex-col gap-4 min-w-[300px] flex-1">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${color}`} />
          <h3 className="font-semibold uppercase text-sm tracking-wider text-muted-foreground">
            {title} ({tasks.length})
          </h3>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {tasks.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center text-muted-foreground text-sm">
              No {status} tasks
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id} className="hover-elevate">
              <CardHeader className="p-4 pb-2">
                <CardTitle className="text-base">{task.title}</CardTitle>
                <CardDescription className="line-clamp-2 text-xs">
                  {task.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 pt-0 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <UserIcon className="w-3 h-3" />
                  <span>Assigned to: {candidates.find(c => c.id === task.assignedTo)?.name || 'Unknown'}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span>Deadline: {format(new Date(task.deadline), "PPp")}</span>
                </div>
                {status === "pending" && (
                  <div className="mt-2 space-y-2">
                    <div className="flex justify-between text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      <span>Progress</span>
                      <span>{task.progress || 0}%</span>
                    </div>
                    <Slider
                      value={[task.progress || 0]}
                      max={100}
                      step={1}
                      onValueChange={([value]) => {
                        // Optimistic update if needed, but for now just wait for mutation
                      }}
                      onValueCommit={([value]) => 
                        updateTaskMutation.mutate({ 
                          id: task.id, 
                          updates: { 
                            progress: value,
                            status: value === 100 ? "submitted" : "pending"
                          } 
                        })
                      }
                    />
                  </div>
                )}
                {status === "submitted" && (
                  <Button 
                    size="sm" 
                    className="w-full mt-2"
                    onClick={() => updateTaskMutation.mutate({ id: task.id, updates: { status: "completed" } })}
                  >
                    <CheckCircle2 className="w-3 h-3 mr-2" />
                    Approve & Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Task Management</h1>
          <p className="text-muted-foreground">Assign and track candidate progress</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-create-task">
              <Plus className="w-4 h-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Task title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Task details..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="assignedTo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assign To</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select candidate" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {candidates.map((candidate) => (
                            <SelectItem key={candidate.id} value={candidate.id}>
                              {candidate.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deadline</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={createTaskMutation.isPending}>
                  {createTaskMutation.isPending ? "Creating..." : "Create Task"}
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-4">
        <StatusColumn title="Pending" status="pending" tasks={tasksByStatus.pending} color="bg-slate-400" />
        <StatusColumn title="Submitted" status="submitted" tasks={tasksByStatus.submitted} color="bg-blue-500" />
        <StatusColumn title="Completed" status="completed" tasks={tasksByStatus.completed} color="bg-green-500" />
      </div>
    </div>
  );
}

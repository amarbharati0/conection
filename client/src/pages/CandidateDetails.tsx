import { Layout } from "@/components/Layout";
import { useRoute } from "wouter";
import { useCandidates } from "@/hooks/use-candidates";
import { useTasks, useCreateTask } from "@/hooks/use-tasks";
import { useAttendance } from "@/hooks/use-attendance";
import { useSubmissions } from "@/hooks/use-submissions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskCard } from "@/components/TaskCard";
import { Plus, MapPin, Calendar, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";
import { format } from "date-fns";

export default function CandidateDetails() {
  const [, params] = useRoute("/admin/candidates/:id");
  const id = params?.id;
  
  const { data: candidates } = useCandidates();
  const candidate = candidates?.find(c => c.id === id);
  
  const { data: tasks } = useTasks(id);
  const { data: attendance } = useAttendance(id);
  const createTask = useCreateTask();

  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof insertTaskSchema>>({
    resolver: zodResolver(insertTaskSchema),
    defaultValues: {
      assignedTo: id,
      title: "",
      description: "",
    }
  });

  const onSubmit = (data: z.infer<typeof insertTaskSchema>) => {
    createTask.mutate({ ...data, assignedTo: id! }, {
      onSuccess: () => {
        setOpen(false);
        form.reset();
      }
    });
  };

  if (!candidate) return <Layout><div className="p-8">Loading...</div></Layout>;

  return (
    <Layout>
      <div className="space-y-8">
        {/* Header Profile */}
        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col md:flex-row items-center md:items-start gap-8 shadow-sm">
          <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
            <AvatarFallback className="bg-primary text-primary-foreground text-4xl">
              {candidate.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 text-center md:text-left space-y-2">
            <h1 className="text-3xl font-bold font-display">{candidate.name}</h1>
            <p className="text-muted-foreground">@{candidate.username}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-4">
              <Badge variant="secondary" className="px-3 py-1">Candidate</Badge>
              {candidate.details?.address && (
                <Badge variant="outline" className="px-3 py-1 gap-1">
                  <MapPin className="w-3 h-3" /> {candidate.details.address}
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 min-w-[200px]">
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full gap-2 shadow-lg shadow-primary/20">
                  <Plus className="w-4 h-4" /> Assign Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Assign New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label>Task Title</Label>
                    <Input {...form.register("title")} placeholder="e.g. Complete Safety Module" />
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea {...form.register("description")} placeholder="Detailed instructions..." />
                  </div>
                  <Button type="submit" className="w-full" disabled={createTask.isPending}>
                    {createTask.isPending ? "Assigning..." : "Assign Task"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Tabs defaultValue="tasks" className="w-full">
          <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="tasks" className="rounded-lg">Tasks & Progress</TabsTrigger>
            <TabsTrigger value="attendance" className="rounded-lg">Attendance Log</TabsTrigger>
          </TabsList>

          <TabsContent value="tasks">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tasks?.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
              {tasks?.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                  No tasks assigned yet.
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="attendance">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {attendance?.map(record => (
                <Card key={record.id} className="overflow-hidden">
                  <div className="aspect-square bg-muted relative">
                    <img 
                      src={record.livePhotoUrl} 
                      alt="Attendance Proof" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded-md backdrop-blur-sm">
                      {format(new Date(record.timestamp), "HH:mm")}
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium text-sm">
                        {format(new Date(record.timestamp), "MMM d, yyyy")}
                      </span>
                    </div>
                    {record.location && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs">{record.location}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {attendance?.length === 0 && (
                <div className="col-span-full py-12 text-center text-muted-foreground">
                  No attendance records found.
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
}

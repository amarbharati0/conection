import { Layout } from "@/components/Layout";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { useAttendance } from "@/hooks/use-attendance";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useCreateSubmission } from "@/hooks/use-submissions";
import { useState } from "react";
import { Task } from "@shared/schema";

export default function CandidateDashboard() {
  const { user } = useAuth();
  const { data: tasks, isLoading } = useTasks(user?.id);
  const { data: attendance } = useAttendance(user?.id);
  
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [proofUrl, setProofUrl] = useState("");
  const createSubmission = useCreateSubmission();

  const activeTasks = tasks?.filter(t => t.status === "pending") || [];
  const completedTasks = tasks?.filter(t => t.status === "completed") || [];

  const handleUpload = (task: Task) => {
    setSelectedTask(task);
  };

  const submitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTask) return;

    // In a real app, we'd handle file upload here.
    // For MVP, we accept a URL or dummy string.
    createSubmission.mutate({
      taskId: selectedTask.id,
      candidateId: user!.id,
      photoUrl: proofUrl, 
      videoUrl: "", // Optional in schema
    }, {
      onSuccess: () => {
        setSelectedTask(null);
        setProofUrl("");
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-display">My Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and submit your daily tasks.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-xl">
            <CardContent className="p-6">
              <div className="text-4xl font-bold mb-1">{activeTasks.length}</div>
              <div className="text-indigo-100 text-sm font-medium opacity-90">Pending Tasks</div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-lg">
            <CardContent className="p-6">
              <div className="text-4xl font-bold mb-1 text-green-600">{completedTasks.length}</div>
              <div className="text-muted-foreground text-sm font-medium">Completed</div>
            </CardContent>
          </Card>
          <Card className="bg-card shadow-lg border-primary/20">
            <CardHeader className="p-4 pb-0">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latest Attendance</CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              {attendance && attendance.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <Clock className="w-4 h-4 text-primary" />
                    {format(new Date(attendance[0].timestamp), "HH:mm, MMM d")}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="truncate">{attendance[0].location}</span>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground italic">No logs yet today</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active">
          <TabsList className="bg-muted/50 p-1 rounded-xl mb-6">
            <TabsTrigger value="active" className="rounded-lg">Active Tasks</TabsTrigger>
            <TabsTrigger value="completed" className="rounded-lg">Completed</TabsTrigger>
          </TabsList>

          <TabsContent value="active">
            {isLoading ? (
              <div className="text-center py-12">Loading tasks...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTasks.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    isCandidate={true} 
                    onUpload={handleUpload}
                  />
                ))}
                {activeTasks.length === 0 && (
                  <div className="col-span-full py-12 text-center text-muted-foreground border-2 border-dashed border-border rounded-xl">
                    No pending tasks! Great job.
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedTasks.map(task => (
                <TaskCard key={task.id} task={task} />
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Submission Dialog */}
        <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Submit Proof for "{selectedTask?.title}"</DialogTitle>
            </DialogHeader>
            <form onSubmit={submitProof} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Proof URL (Photo/Video)</Label>
                <Input 
                  value={proofUrl} 
                  onChange={(e) => setProofUrl(e.target.value)} 
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  For MVP, please paste a link to your proof (Drive, Dropbox, etc.)
                </p>
              </div>
              <Button type="submit" className="w-full" disabled={createSubmission.isPending}>
                {createSubmission.isPending ? "Submitting..." : "Submit Proof"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}

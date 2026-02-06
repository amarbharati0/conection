import { type Task } from "@shared/schema";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { CheckCircle2, Clock, Upload } from "lucide-react";
import { format } from "date-fns";

interface TaskCardProps {
  task: Task;
  onUpload?: (task: Task) => void;
  isCandidate?: boolean;
}

export function TaskCard({ task, onUpload, isCandidate }: TaskCardProps) {
  const isCompleted = task.status === "completed";

  return (
    <Card className={`
      interactive-card overflow-hidden flex flex-col h-full
      ${isCompleted ? 'border-l-4 border-l-green-500' : 'border-l-4 border-l-amber-500'}
    `}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-4">
          <Badge variant={isCompleted ? "default" : "secondary"} className={
            isCompleted ? "bg-green-500/15 text-green-700 hover:bg-green-500/25" : "bg-amber-500/15 text-amber-700 hover:bg-amber-500/25"
          }>
            {isCompleted ? (
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3" /> Completed</span>
            ) : (
              <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> Pending</span>
            )}
          </Badge>
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {format(new Date(task.createdAt), "MMM d, yyyy")}
          </span>
        </div>
        <CardTitle className="text-xl mt-2 leading-tight">{task.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="flex-1">
        <p className="text-muted-foreground text-sm leading-relaxed">
          {task.description}
        </p>
      </CardContent>

      {isCandidate && !isCompleted && onUpload && (
        <CardFooter className="pt-0">
          <Button 
            className="w-full gap-2 bg-gradient-to-r from-primary to-indigo-600 hover:opacity-90 shadow-lg shadow-primary/20"
            onClick={() => onUpload(task)}
          >
            <Upload className="w-4 h-4" />
            Submit Proof
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

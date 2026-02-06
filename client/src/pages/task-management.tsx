import { Layout } from "@/components/Layout";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Plus, CheckSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function TaskManagement() {
  const columns = [
    { id: "pending", label: "PENDING", count: 0, color: "text-slate-400" },
    { id: "submitted", label: "SUBMITTED", count: 0, color: "text-blue-500" },
    { id: "completed", label: "COMPLETED", count: 0, color: "text-green-500" },
  ];

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">
                Task Management
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1">
                Assign and track candidate progress
              </p>
            </div>
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 rounded-xl">
              <Plus className="w-4 h-4" />
              Create Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {columns.map((column) => (
              <div key={column.id} className="space-y-4">
                <div className="flex items-center gap-2 px-1">
                  <div className={`w-1.5 h-1.5 rounded-full bg-current ${column.color}`} />
                  <h2 className={`text-sm font-semibold tracking-wider uppercase ${column.color}`}>
                    {column.label} ({column.count})
                  </h2>
                </div>
                
                <Card className="border-dashed border-2 bg-slate-50/50 dark:bg-slate-900/20 min-h-[400px] flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <p className="text-slate-400 dark:text-slate-500 font-medium">
                      No {column.id} tasks
                    </p>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

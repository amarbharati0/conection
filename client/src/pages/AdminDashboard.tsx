import { Layout } from "@/components/Layout";
import { useCandidates } from "@/hooks/use-candidates";
import { useAuth } from "@/hooks/use-auth";
import { useTasks } from "@/hooks/use-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  ClipboardList
} from "lucide-react";
import { Link } from "wouter";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid
} from "recharts";

const taskCompletionData = [
  { name: 'Mon', completed: 4, previous: 2.5 },
  { name: 'Tue', completed: 3, previous: 5 },
  { name: 'Wed', completed: 6, previous: 3.5 },
  { name: 'Thu', completed: 2, previous: 4 },
  { name: 'Fri', completed: 8, previous: 3.2 },
];

const attendanceTrendsData = [
  { name: 'Mon', value: 4 },
  { name: 'Tue', value: 3.5 },
  { name: 'Wed', value: 6 },
  { name: 'Thu', value: 2.5 },
  { name: 'Fri', value: 8 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: candidates, isLoading: candidatesLoading } = useCandidates();
  const { data: tasks, isLoading: tasksLoading } = useTasks();

  const isLoading = candidatesLoading || tasksLoading;

  const activeTasks = tasks?.filter(t => t.status === "pending" || t.status === "submitted") || [];
  const completedTasks = tasks?.filter(t => t.status === "completed") || [];

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold font-display tracking-tight text-slate-900 dark:text-slate-100">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-lg">
            Welcome back, here's what's happening today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 rounded-3xl p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-500">Total Candidates</CardTitle>
                <div className="text-3xl font-bold">{candidates?.length || 0}</div>
              </div>
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  +12%
                </div>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 rounded-3xl p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-500">Active Tasks</CardTitle>
                <div className="text-3xl font-bold">{activeTasks.length}</div>
              </div>
              <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-2xl">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-full text-xs font-semibold">
                  <TrendingUp className="w-3 h-3" />
                  +5%
                </div>
                <span className="text-xs text-slate-400">vs last month</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 rounded-3xl p-2">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div className="space-y-1">
                <CardTitle className="text-sm font-medium text-slate-500">Completed Tasks</CardTitle>
                <div className="text-3xl font-bold">{completedTasks.length}</div>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-6 mt-2" /> {/* Placeholder for alignment */}
            </CardContent>
          </Card>

          <Link href="/admin/tasks" className="block cursor-pointer">
            <Card className="border-none shadow-sm bg-primary/10 hover:bg-primary/20 transition-colors rounded-3xl p-2 h-full">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="space-y-1">
                  <CardTitle className="text-sm font-medium text-primary">Manage Tasks</CardTitle>
                  <div className="text-xs text-primary/80">Go to task board →</div>
                </div>
                <div className="p-3 bg-primary/20 rounded-2xl">
                  <ClipboardList className="w-5 h-5 text-primary" />
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Bar Chart */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 rounded-[2rem] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-display">Weekly Task Completion</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pr-8">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={taskCompletionData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: '#94a3b8'}}
                    dy={10}
                  />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: '#94a3b8'}}
                  />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="completed" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={24} />
                  <Bar dataKey="previous" fill="#e2e8f0" radius={[6, 6, 0, 0]} barSize={24} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Line Chart */}
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900/50 rounded-[2rem] overflow-hidden">
            <CardHeader>
              <CardTitle className="text-xl font-bold font-display">Attendance Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-[350px] pr-8">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={attendanceTrendsData} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: '#94a3b8'}}
                    dy={10}
                  />
                  <YAxis 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{fill: '#94a3b8'}}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10b981" 
                    strokeWidth={3} 
                    dot={false}
                    animationDuration={1500}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}

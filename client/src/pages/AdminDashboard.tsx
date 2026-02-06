import { Layout } from "@/components/Layout";
import { useCandidates } from "@/hooks/use-candidates";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, CheckCircle2, AlertCircle, MapPin } from "lucide-react";
import { Link } from "wouter";
import { useAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  Cell 
} from "recharts";

// Mock data for the chart since we don't have an aggregated stats endpoint
const statsData = [
  { name: 'Mon', completed: 12, pending: 8 },
  { name: 'Tue', completed: 15, pending: 5 },
  { name: 'Wed', completed: 18, pending: 2 },
  { name: 'Thu', completed: 10, pending: 10 },
  { name: 'Fri', completed: 14, pending: 6 },
];

export default function AdminDashboard() {
  const { user } = useAuth();
  const { data: candidates, isLoading } = useCandidates();
  const { data: allAttendance } = useAttendance();

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Overview</h1>
            <p className="text-muted-foreground mt-1">
              Welcome back, {user?.name}. Here's what's happening today.
            </p>
          </div>
          <Link href="/admin/candidates">
            <Button className="rounded-xl shadow-lg shadow-primary/20 gap-2">
              <Users className="w-4 h-4" />
              Manage Candidates
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Candidates</CardTitle>
              <Users className="w-4 h-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{candidates?.length || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">+2 from last week</p>
            </CardContent>
          </Card>
          
          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Tasks Completed</CardTitle>
              <CheckCircle2 className="w-4 h-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">128</div>
              <p className="text-xs text-muted-foreground mt-1">84% completion rate</p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending Review</CardTitle>
              <AlertCircle className="w-4 h-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">14</div>
              <p className="text-xs text-muted-foreground mt-1">Requires attention</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Task Completion Trend</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsData}>
                  <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Bar dataKey="completed" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} barSize={32} />
                  <Bar dataKey="pending" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Recent Candidates List */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registered Candidates</CardTitle>
              <Link href="/admin/candidates">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {candidates?.slice(0, 5).map((candidate) => (
                <div key={candidate.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-9 w-9 border border-border">
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {candidate.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{candidate.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">@{candidate.username}</p>
                    </div>
                  </div>
                  <Link href={`/admin/candidates/${candidate.id}`}>
                    <Button variant="outline" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                      Manage
                    </Button>
                  </Link>
                </div>
              ))}
              
              {(!candidates || candidates.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  No candidates found.
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Live Attendance Feed */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-display">Live Attendance Feed</h2>
            <Link href="/admin/candidates">
              <Button variant="outline" size="sm">History</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {allAttendance?.slice(0, 4).map(record => {
              const candidate = candidates?.find(c => c.id === record.candidateId);
              return (
                <Card key={record.id} className="overflow-hidden group">
                  <div className="aspect-[4/3] relative">
                    <img 
                      src={record.livePhotoUrl} 
                      alt="Attendance" 
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    <div className="absolute bottom-2 left-2 right-2 text-white">
                      <p className="text-xs font-medium truncate">{candidate?.name || 'Candidate'}</p>
                      <div className="flex items-center gap-1 mt-0.5 text-[10px] opacity-80">
                        <MapPin className="w-2.5 h-2.5" />
                        <span className="truncate">{record.location}</span>
                      </div>
                      <p className="text-[10px] opacity-60">{format(new Date(record.timestamp), "HH:mm, MMM d")}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
            {(!allAttendance || allAttendance.length === 0) && (
              <div className="col-span-full py-8 text-center text-muted-foreground border-2 border-dashed rounded-xl">
                No attendance logs recorded today.
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

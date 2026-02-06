import { Layout } from "@/components/Layout";
import { useCandidates } from "@/hooks/use-candidates";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export default function CandidateList() {
  const { data: candidates, isLoading } = useCandidates();
  const [search, setSearch] = useState("");

  const filtered = candidates?.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-display">Candidates</h1>
            <p className="text-muted-foreground mt-1">
              Manage profiles and assign tasks.
            </p>
          </div>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-10 h-12 rounded-xl bg-card border-border"
            placeholder="Search by name or username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered?.map((candidate) => (
              <Card key={candidate.id} className="interactive-card">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <Avatar className="w-20 h-20 border-4 border-background shadow-lg">
                      <AvatarFallback className="bg-gradient-to-br from-primary to-indigo-600 text-white text-2xl">
                        {candidate.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">{candidate.name}</h3>
                      <p className="text-sm text-muted-foreground">@{candidate.username}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 w-full pt-2">
                      <div className="bg-secondary/50 rounded-lg p-2 text-center">
                        <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider">Role</span>
                        <span className="font-medium text-sm capitalize">{candidate.role}</span>
                      </div>
                      <div className="bg-secondary/50 rounded-lg p-2 text-center">
                        <span className="block text-xs text-muted-foreground uppercase font-bold tracking-wider">Status</span>
                        <span className="font-medium text-sm text-green-600">Active</span>
                      </div>
                    </div>

                    <Link href={`/admin/candidates/${candidate.id}`} className="w-full">
                      <Button className="w-full rounded-xl" variant="outline">
                        View Profile
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

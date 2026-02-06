import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { CheckCircle2, ShieldCheck, User } from "lucide-react";
import { insertUserSchema, userRole } from "@shared/schema";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function AuthPage() {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const [, setLocation] = useLocation();

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<z.infer<typeof insertUserSchema>>({
    resolver: zodResolver(insertUserSchema),
    defaultValues: {
      role: "candidate",
      details: { age: 18, address: "", phone: "" },
    },
  });

  const onLogin = (data: z.infer<typeof loginSchema>) => {
    login(data);
  };

  const onRegister = (data: z.infer<typeof insertUserSchema>) => {
    register(data);
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-background">
      {/* Left Panel - Visual */}
      <div className="hidden lg:flex flex-col justify-between p-12 bg-zinc-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-purple-900/90"></div>
        
        <div className="relative z-10">
          <h1 className="text-4xl font-bold font-display tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-10 h-10 text-primary" />
            MonitorPro
          </h1>
          <p className="mt-4 text-indigo-100 text-lg max-w-md leading-relaxed">
            The complete solution for candidate tracking, task management, and verified attendance monitoring.
          </p>
        </div>

        <div className="relative z-10 space-y-6">
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <CheckCircle2 className="w-6 h-6 text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Task Tracking</h3>
              <p className="text-indigo-200/80">Monitor progress in real-time with visual proof submissions.</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="p-2 rounded-lg bg-white/10 backdrop-blur-sm">
              <User className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Attendance Verification</h3>
              <p className="text-indigo-200/80">Live photo capture ensures authentic daily check-ins.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-sm text-indigo-300">
          © 2024 MonitorPro Inc. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Forms */}
      <div className="flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold font-display text-foreground">Welcome Back</h2>
            <p className="text-muted-foreground mt-2">Sign in to your dashboard or create a new account.</p>
          </div>

          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8 h-12 rounded-xl bg-muted/50 p-1">
              <TabsTrigger value="login" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Login</TabsTrigger>
              <TabsTrigger value="register" className="rounded-lg data-[state=active]:bg-background data-[state=active]:shadow-sm">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <Card className="border-none shadow-none">
                <form onSubmit={loginForm.handleSubmit(onLogin)}>
                  <CardContent className="space-y-4 px-0">
                    <div className="space-y-2">
                      <Label htmlFor="username">Username</Label>
                      <Input 
                        id="username" 
                        placeholder="Enter your username" 
                        {...loginForm.register("username")}
                        className="h-11 rounded-lg"
                      />
                      {loginForm.formState.errors.username && (
                        <p className="text-xs text-destructive">{loginForm.formState.errors.username.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="••••••••" 
                        {...loginForm.register("password")}
                        className="h-11 rounded-lg"
                      />
                      {loginForm.formState.errors.password && (
                        <p className="text-xs text-destructive">{loginForm.formState.errors.password.message}</p>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="px-0 pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20" 
                      disabled={isLoggingIn}
                    >
                      {isLoggingIn ? "Signing In..." : "Sign In"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
            
            <TabsContent value="register">
              <Card className="border-none shadow-none">
                <form onSubmit={registerForm.handleSubmit(onRegister)}>
                  <CardContent className="space-y-4 px-0">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Full Name</Label>
                        <Input 
                          placeholder="John Doe" 
                          {...registerForm.register("name")}
                          className="h-11 rounded-lg"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Username</Label>
                        <Input 
                          placeholder="johndoe" 
                          {...registerForm.register("username")}
                          className="h-11 rounded-lg"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Password</Label>
                      <Input 
                        type="password" 
                        placeholder="••••••••" 
                        {...registerForm.register("password")}
                        className="h-11 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>Address (Optional)</Label>
                      <Input 
                        placeholder="City, State" 
                        {...registerForm.register("details.address")}
                        className="h-11 rounded-lg"
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="px-0 pt-2">
                    <Button 
                      type="submit" 
                      className="w-full h-11 rounded-xl text-base font-semibold shadow-lg shadow-primary/20" 
                      disabled={isRegistering}
                    >
                      {isRegistering ? "Creating Account..." : "Create Candidate Account"}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

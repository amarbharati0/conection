import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { useLocation } from "wouter";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import type { User, InsertUser } from "@shared/schema";

// Simple state management for auth
// In a real app, this might verify a session token on load
export function useAuth() {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem("monitor_user");
    return stored ? JSON.parse(stored) : null;
  });
  
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: async (credentials: z.infer<typeof api.auth.login.input>) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
      });

      if (!res.ok) {
        if (res.status === 401) throw new Error("Invalid credentials");
        throw new Error("Login failed");
      }

      return api.auth.login.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      setUser(data);
      localStorage.setItem("monitor_user", JSON.stringify(data));
      toast({ title: "Welcome back!", description: `Logged in as ${data.role}` });
      if (data.role === "admin") {
        setLocation("/admin");
      } else {
        setLocation("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast({ 
        title: "Login Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: InsertUser) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Registration failed");
      }

      return api.auth.register.responses[201].parse(await res.json());
    },
    onSuccess: (data) => {
      setUser(data);
      localStorage.setItem("monitor_user", JSON.stringify(data));
      toast({ title: "Account created!", description: "Welcome to the platform." });
      setLocation("/dashboard");
    },
    onError: (error: Error) => {
      toast({ 
        title: "Registration Failed", 
        description: error.message,
        variant: "destructive" 
      });
    },
  });

  const logout = () => {
    setUser(null);
    localStorage.removeItem("monitor_user");
    setLocation("/auth");
    toast({ title: "Logged out", description: "See you next time" });
  };

  return {
    user,
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
  };
}

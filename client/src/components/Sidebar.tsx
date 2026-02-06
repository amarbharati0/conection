import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  LogOut, 
  Camera,
  Menu,
  X,
  Bell,
  Settings,
  FileText,
  CalendarDays
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);

  const adminLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/candidates", label: "Candidates", icon: Users },
    { href: "/admin/attendance", label: "Attendance", icon: CalendarDays },
    { href: "/admin/reports", label: "Reports", icon: FileText },
    { href: "/admin/notifications", label: "Notifications", icon: Bell },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  const candidateLinks = [
    { href: "/dashboard", label: "My Tasks", icon: CheckSquare },
    { href: "/attendance", label: "Attendance", icon: Camera },
  ];

  const links = user?.role === "admin" ? adminLinks : candidateLinks;

  const NavContent = () => (
    <div className="flex flex-col h-full py-6 bg-slate-50 dark:bg-slate-950/50">
      <div className="px-6 mb-8 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
          <div className="w-5 h-5 bg-white rounded-full opacity-90" />
        </div>
        <h1 className="text-xl font-bold font-display tracking-tight">
          MonitorPro
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          
          return (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer group
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" 
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-100"
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-white" : "text-slate-400 group-hover:text-primary"}`} />
                <span className="font-medium">{link.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <div className="bg-slate-100 dark:bg-slate-900/50 rounded-2xl p-4 mb-4 border border-slate-200/50 dark:border-slate-800/50">
          <div className="flex flex-col gap-1">
            <p className="text-xs font-semibold text-primary uppercase tracking-wider">Pro Plan</p>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Admin Access</p>
          </div>
        </div>
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-3 text-slate-500 hover:text-destructive hover:bg-destructive/10 rounded-xl"
          onClick={logout}
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Trigger */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shadow-md bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80">
            <NavContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-72 h-screen border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 fixed left-0 top-0 z-40">
        <NavContent />
      </aside>
    </>
  );
}

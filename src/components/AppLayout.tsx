import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Bell, Search, Plus } from "lucide-react";

interface AppLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  action?: ReactNode;
}

export function AppLayout({ children, title, subtitle, action }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-border bg-[hsl(var(--surface-1))] flex-shrink-0">
          <div>
            {title && (
              <h1 className="text-lg font-bold text-foreground">{title}</h1>
            )}
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative hidden md:flex items-center">
              <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground" />
              <input
                className="bg-[hsl(var(--surface-2))] border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground w-56 focus:outline-none focus:ring-1 focus:ring-[hsl(var(--teal))] focus:border-[hsl(var(--teal))] transition-all"
                placeholder="Buscar paciente..."
              />
            </div>

            {/* Notifications */}
            <button className="relative p-2 rounded-lg bg-[hsl(var(--surface-2))] border border-border hover:border-[hsl(var(--teal)/0.3)] transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[hsl(var(--teal))] pulse-teal" />
            </button>

            {action}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

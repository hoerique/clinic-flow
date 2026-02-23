import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Calendar,
  TrendingUp,
  MessageSquare,
  DollarSign,
  Settings,
  Bell,
  ChevronDown,
  Stethoscope,
  LogOut,
  UserCog,
  BarChart3,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

const navItems = [
  {
    section: "Principal",
    items: [
      { to: "/", label: "Dashboard", icon: LayoutDashboard },
      { to: "/agenda", label: "Agenda", icon: Calendar, badge: "8" },
      { to: "/pacientes", label: "Pacientes", icon: Users },
    ],
  },
  {
    section: "Comercial",
    items: [
      { to: "/funil", label: "Funil Comercial", icon: TrendingUp },
      { to: "/financeiro", label: "Financeiro", icon: DollarSign },
      { to: "/relatorios", label: "Relatórios", icon: BarChart3 },
    ],
  },
  {
    section: "Automação",
    items: [
      { to: "/automacoes", label: "WhatsApp & Automações", icon: MessageSquare, badge: "Novo" },
    ],
  },
  {
    section: "Sistema",
    items: [
      { to: "/usuarios", label: "Usuários & Perfis", icon: UserCog },
      { to: "/configuracoes", label: "Configurações", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-[hsl(var(--sidebar-background))] border-r border-[hsl(var(--sidebar-border))]">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-[hsl(var(--sidebar-border))]">
        <div>
          <p className="text-sm font-bold text-foreground tracking-tight">CRM Luiza</p>
          <p className="text-[10px] text-muted-foreground font-medium">Clínica Sorriso Premium</p>
        </div>
      </div>

      {/* Plan badge */}
      <div className="mx-4 mt-3 mb-1 px-3 py-2 rounded-lg bg-[hsl(var(--teal)/0.1)] border border-[hsl(var(--teal)/0.2)]">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-semibold text-[hsl(var(--teal))]">Plano Professional</span>
          <span className="text-[10px] text-muted-foreground">28 dias</span>
        </div>
        <div className="mt-1.5 h-1 rounded-full bg-[hsl(var(--surface-3))]">
          <div className="h-1 rounded-full gradient-primary" style={{ width: "68%" }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">68/100 mensagens WhatsApp</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 overflow-y-auto">
        {navItems.map((section) => (
          <div key={section.section} className="mb-4">
            <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
              {section.section}
            </p>
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.to);
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-all duration-150 ${active ? "nav-item-active" : "nav-item"
                    }`}
                >
                  <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-[hsl(var(--teal))]" : ""}`} />
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${item.badge === "Novo"
                        ? "bg-[hsl(var(--teal)/0.2)] text-[hsl(var(--teal))]"
                        : "bg-[hsl(var(--surface-3))] text-muted-foreground"
                      }`}>
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User profile */}
      <div className="px-3 pb-4 border-t border-[hsl(var(--sidebar-border))] pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer hover:bg-[hsl(var(--sidebar-accent))] transition-colors">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-[hsl(var(--primary-foreground))]">DA</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">Dr. Anderson</p>
            <p className="text-[10px] text-muted-foreground">Administrador</p>
          </div>
          <LogOut className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
        </div>
      </div>
    </aside>
  );
}

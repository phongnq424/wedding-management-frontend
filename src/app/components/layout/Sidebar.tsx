import React from "react";
import {
  LayoutDashboard, Calendar, Building2, Layers, Clock, Sparkles,
  UtensilsCrossed, Package, Users, CreditCard, FileText, BarChart3,
  Shield, Settings, CalendarCheck, History,
} from "lucide-react";
import { Screen, Role } from "../../types";

interface SidebarProps {
  screen: Screen;
  setScreen: (s: Screen) => void;
  userRole: Role;
}

export const Sidebar = ({ screen, setScreen, userRole }: SidebarProps) => {
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", screen: "dashboard" as Screen },
    { icon: Calendar, label: "Booking", screen: "booking" as Screen },
    { icon: CalendarCheck, label: "Check Availability", screen: "booking-availability" as Screen },
    { icon: Building2, label: "Hall Management", screen: "hall-list" as Screen },
    { icon: Layers, label: "Hall Type", screen: "hall-type-list" as Screen },
    { icon: Clock, label: "Shift", screen: "shift-list" as Screen },
    { icon: Sparkles, label: "Service", screen: "service-list" as Screen },
    { icon: Layers, label: "Dish Types", screen: "dish-type-list" as Screen },
    { icon: UtensilsCrossed, label: "Dishes", screen: "dish-list" as Screen },
    { icon: Package, label: "Dish Combos", screen: "dish-combo-list" as Screen },
    { icon: Package, label: "Wedding Packages", screen: "package-list" as Screen },
    { icon: UtensilsCrossed, label: "Menu / Packages", screen: "menu" as Screen },
    { icon: Users, label: "Staff", screen: "staff" as Screen },
    { icon: CreditCard, label: "Payment", screen: "payment" as Screen },
    { icon: FileText, label: "Invoice", screen: "invoice" as Screen },
    { icon: BarChart3, label: "Reports", screen: "reports" as Screen },
    { icon: History, label: "Audit Logs", screen: "audit" as Screen },
    { icon: Shield, label: "Role & Permission", screen: "roles" as Screen },
    { icon: Settings, label: "System Config", screen: "settings" as Screen },
  ];

  return (
    <div className="w-64 bg-sidebar text-sidebar-foreground h-screen fixed left-0 top-0 flex flex-col border-r border-sidebar-border">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sidebar-primary to-[#b89851] flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">Wedding Center</h2>
            <p className="text-xs text-sidebar-foreground/60">Management</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setScreen(item.screen)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
              screen === item.screen
                ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-medium">{item.label}</span>
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-sidebar-accent">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-sidebar-primary">
            <img
              src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
              alt="User"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Trần Minh Tuấn</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{userRole}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
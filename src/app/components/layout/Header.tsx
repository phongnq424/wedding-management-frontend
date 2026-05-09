import React from "react";
import { Bell, Search, LogOut } from "lucide-react";
import { Screen, Role } from "../../types";

interface HeaderProps {
  showNotifications: boolean;
  setShowNotifications: (v: boolean) => void;
  userRole: Role;
  setIsLoggedIn: (v: boolean) => void;
  setScreen: (s: Screen) => void;
}

export const Header = ({
  showNotifications,
  setShowNotifications,
  userRole,
  setIsLoggedIn,
  setScreen,
}: HeaderProps) => (
  <div className="h-16 bg-card border-b border-border fixed top-0 right-0 left-64 z-10 flex items-center justify-between px-6">
    <div className="flex items-center gap-4 flex-1 max-w-2xl">
      <Search className="w-5 h-5 text-muted-foreground" />
      <input
        type="text"
        placeholder="Search bookings, halls, customers..."
        className="flex-1 px-4 py-2 bg-secondary rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-accent/50 transition-all"
      />
    </div>

    <div className="flex items-center gap-4">
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 hover:bg-secondary rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5 text-foreground" />
        <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
      </button>

      <div className="flex items-center gap-3 pl-4 border-l border-border">
        <div className="text-right">
          <p className="text-sm font-medium">Trần Minh Tuấn</p>
          <p className="text-xs text-muted-foreground">{userRole}</p>
        </div>
        <div className="w-9 h-9 rounded-full overflow-hidden bg-muted">
          <img
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>
        <button
          onClick={() => { setIsLoggedIn(false); setScreen("login"); }}
          className="p-2 hover:bg-secondary rounded-xl transition-colors"
        >
          <LogOut className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </div>

    {showNotifications && (
      <div className="absolute top-full right-6 mt-2 w-96 bg-card rounded-[20px] shadow-lg border border-border overflow-hidden">
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold">Notifications</h3>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {[
            { title: "New booking confirmed", detail: "BK2024003 - Diamond Hall", time: "5 minutes ago", type: "success" },
            { title: "Payment received", detail: "85,000,000 VND for BK2024001", time: "1 hour ago", type: "info" },
            { title: "Hall maintenance scheduled", detail: "Ruby Hall - Tomorrow 9:00 AM", time: "3 hours ago", type: "warning" },
          ].map((notif, idx) => (
            <div key={idx} className="p-4 border-b border-border hover:bg-secondary/50 transition-colors">
              <p className="text-sm font-medium">{notif.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{notif.detail}</p>
              <p className="text-xs text-muted-foreground mt-1">{notif.time}</p>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <button className="text-sm text-accent hover:text-accent/80 w-full text-center">
            View all notifications
          </button>
        </div>
      </div>
    )}
  </div>
);

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
            src="https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/658147736_26365171686509280_846721001566995266_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=1d70fc&_nc_eui2=AeFg_ENwbXORWHUkm6HOaJDMfkqhkwVovAV-SqGTBWi8BZU05d9v0-RPGav75XyNDY8ptb894_ZsGJvr5qIOfa6N&_nc_ohc=sO5jjPOp_gQQ7kNvwHCxE0c&_nc_oc=Adoijol774-0jJjn1GVs2TId3z5vvEszt2COOypKniTKVfYwpSBzM7Rt4FO-QVrDsV8&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=YjjCBt33iDr50CRAq5RPrQ&_nc_ss=7b2a8&oh=00_Af71MB9aKiTisc8dHdZ6dzS6XbReGh3OPsrpbAMs3_zLBA&oe=6A07C16F"
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

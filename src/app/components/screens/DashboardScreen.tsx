import React from "react";
import {
  DollarSign, CalendarCheck, Home, Percent, TrendingUp, TrendingDown,
  Calendar, ChevronRight, CreditCard, FileText, BarChart3, AlertCircle, Plus,
} from "lucide-react";
import { Screen } from "../../types";
import { BOOKINGS } from "../../data";
import { StatusBadge } from "../../utils";

interface DashboardScreenProps {
  setScreen: (s: Screen) => void;
}

/* ── Lightweight CSS bar chart (no recharts) ── */
const RevenueBarChart = () => {
  const data = [
    { month: "Aug", revenue: 450 },
    { month: "Sep", revenue: 580 },
    { month: "Oct", revenue: 520 },
    { month: "Nov", revenue: 680 },
    { month: "Dec", revenue: 820 },
    { month: "Jan", revenue: 950 },
  ];
  const max = Math.max(...data.map((d) => d.revenue));
  const chartH = 180;
  const barW = 32;
  const gap = 16;
  const paddingLeft = 48;
  const paddingBottom = 28;
  const totalW = paddingLeft + data.length * (barW + gap) - gap + 8;
  const yTicks = [0, 250, 500, 750, 1000];

  const toY = (v: number) => chartH - (v / max) * chartH;

  return (
    <div className="overflow-x-auto">
      <svg width={totalW} height={chartH + paddingBottom + 10} style={{ display: "block", margin: "0 auto" }}>
        {/* Y gridlines + labels */}
        {yTicks.map((tick) => {
          const y = toY(tick);
          return (
            <g key={`ytick-${tick}`}>
              <line x1={paddingLeft} y1={y} x2={totalW} y2={y} stroke="#e0dbd5" strokeDasharray="3 3" />
              <text x={paddingLeft - 6} y={y + 4} textAnchor="end" fontSize={10} fill="#6b6b7e">{tick}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = paddingLeft + i * (barW + gap);
          const barH = (d.revenue / max) * chartH;
          const y = chartH - barH;
          return (
            <g key={`bar-${d.month}`}>
              <rect x={x} y={y} width={barW} height={barH} fill="#c9a961" rx={6} ry={6} />
              <text x={x + barW / 2} y={chartH + paddingBottom - 4} textAnchor="middle" fontSize={11} fill="#6b6b7e">{d.month}</text>
              <text x={x + barW / 2} y={y - 5} textAnchor="middle" fontSize={10} fill="#c9a961">{d.revenue}</text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

/* ── Lightweight horizontal-bar occupancy chart (no recharts) ── */
const OccupancyChart = () => {
  const data = [
    { name: "Sapphire Hall", value: 90, color: "#c9a961" },
    { name: "Diamond Hall", value: 85, color: "#1a1a2e" },
    { name: "Ruby Hall",    value: 72, color: "#8b7355" },
    { name: "Pearl Hall",   value: 45, color: "#e8d4b0" },
  ];

  return (
    <div className="space-y-4 pt-2">
      {data.map((d) => (
        <div key={`occ-${d.name}`}>
          <div className="flex justify-between mb-1">
            <span style={{ fontSize: 13, color: "#3d3d52" }}>{d.name}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: d.color }}>{d.value}%</span>
          </div>
          <div className="w-full rounded-full" style={{ height: 10, backgroundColor: "#f0ece6" }}>
            <div
              className="rounded-full"
              style={{ width: `${d.value}%`, height: 10, backgroundColor: d.color, transition: "width 0.6s ease" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

export const DashboardScreen = ({ setScreen }: DashboardScreenProps) => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-semibold text-primary mb-2">Dashboard</h1>
      <p className="text-muted-foreground">Welcome back, Trần Minh Tuấn</p>
    </div>

    {/* KPI Cards */}
    <div className="grid grid-cols-4 gap-6">
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-accent" />
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">Monthly Revenue</p>
        <h3 className="text-2xl font-semibold text-primary mb-1">950.5M VND</h3>
        <p className="text-xs text-green-600">+15.3% from last month</p>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarCheck className="w-6 h-6 text-primary" />
          </div>
          <TrendingUp className="w-5 h-5 text-green-500" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">Total Bookings</p>
        <h3 className="text-2xl font-semibold text-primary mb-1">48</h3>
        <p className="text-xs text-green-600">+8 new this month</p>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
            <Home className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">Today</span>
        </div>
        <p className="text-sm text-muted-foreground mb-1">Today's Events</p>
        <h3 className="text-2xl font-semibold text-primary mb-1">3</h3>
        <p className="text-xs text-muted-foreground">2 in progress, 1 upcoming</p>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-start justify-between mb-4">
          <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
            <Percent className="w-6 h-6 text-accent" />
          </div>
          <TrendingDown className="w-5 h-5 text-red-500" />
        </div>
        <p className="text-sm text-muted-foreground mb-1">Occupancy Rate</p>
        <h3 className="text-2xl font-semibold text-primary mb-1">73%</h3>
        <p className="text-xs text-red-600">-2% from last month</p>
      </div>
    </div>

    {/* Charts — pure SVG/CSS, no recharts */}
    <div className="grid grid-cols-2 gap-6">
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-4">Revenue Trend (Million VND)</h3>
        <RevenueBarChart />
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-4">Hall Occupancy Rate</h3>
        <OccupancyChart />
      </div>
    </div>

    {/* Stats */}
    <div className="grid grid-cols-3 gap-6">
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Pending Payments</h3>
          <CreditCard className="w-5 h-5 text-amber-600" />
        </div>
        <p className="text-3xl font-semibold text-amber-600 mb-1">12</p>
        <p className="text-sm text-muted-foreground">Total: 285,000,000 VND</p>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Pending Invoices</h3>
          <FileText className="w-5 h-5 text-blue-600" />
        </div>
        <p className="text-3xl font-semibold text-blue-600 mb-1">8</p>
        <p className="text-sm text-muted-foreground">Awaiting generation</p>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">Cancellation Rate</h3>
          <AlertCircle className="w-5 h-5 text-red-600" />
        </div>
        <p className="text-3xl font-semibold text-red-600 mb-1">5.2%</p>
        <p className="text-sm text-muted-foreground">3 bookings this month</p>
      </div>
    </div>

    {/* Upcoming Events */}
    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-primary">Upcoming Events</h3>
        <button className="text-sm text-accent hover:text-accent/80">View all</button>
      </div>
      <div className="space-y-3">
        {BOOKINGS.slice(0, 3).map((booking) => (
          <div key={booking.id} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:bg-secondary/50 transition-colors">
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Calendar className="w-6 h-6 text-accent" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">{booking.hall}</p>
              <p className="text-sm text-muted-foreground">{booking.customer} • {booking.date} • {booking.shift}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{booking.tables} tables</p>
              <StatusBadge status={booking.status} />
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </div>
        ))}
      </div>
    </div>

    {/* Quick Actions */}
    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
      <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
      <div className="grid grid-cols-4 gap-4">
        <button onClick={() => setScreen("booking")} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:bg-accent/5 hover:border-accent transition-all">
          <Plus className="w-6 h-6 text-accent" />
          <span className="text-sm font-medium">New Booking</span>
        </button>
        <button onClick={() => setScreen("payment")} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:bg-accent/5 hover:border-accent transition-all">
          <CreditCard className="w-6 h-6 text-accent" />
          <span className="text-sm font-medium">Process Payment</span>
        </button>
        <button onClick={() => setScreen("invoice")} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:bg-accent/5 hover:border-accent transition-all">
          <FileText className="w-6 h-6 text-accent" />
          <span className="text-sm font-medium">Generate Invoice</span>
        </button>
        <button onClick={() => setScreen("reports")} className="flex flex-col items-center gap-3 p-4 rounded-xl border border-border hover:bg-accent/5 hover:border-accent transition-all">
          <BarChart3 className="w-6 h-6 text-accent" />
          <span className="text-sm font-medium">View Reports</span>
        </button>
      </div>
    </div>
  </div>
);

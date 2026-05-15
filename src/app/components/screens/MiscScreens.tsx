import React from "react";
import {
  Plus, Filter, Download, Eye, Edit, Trash2, UserCog, BarChart3,
  DollarSign, CalendarCheck, Percent, AlertCircle,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Role } from "../../types";
import { STAFF, PERMISSIONS, AUDIT_LOGS } from "../../data";
import { formatVND, StatusBadge } from "../../utils";


export const StaffScreen = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-2">Staff Management</h1>
        <p className="text-muted-foreground">Manage staff accounts and role assignments</p>
      </div>
      <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
        <Plus className="w-5 h-5" /> Add Staff Member
      </button>
    </div>

    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Staff Member</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Email</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Phone</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Role</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Status</th>
              <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {STAFF.map((staff) => (
              <tr key={staff.id} className="hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-muted">
                      <img src={staff.avatar} alt={staff.name} className="w-full h-full object-cover" />
                    </div>
                    <span className="font-medium text-foreground">{staff.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-muted-foreground">{staff.email}</td>
                <td className="px-6 py-4 text-sm text-muted-foreground font-mono">{staff.phone}</td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-accent/20 text-accent border border-accent/30">{staff.role}</span>
                </td>
                <td className="px-6 py-4"><StatusBadge status={staff.status} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-2">
                    <button className="p-2 text-accent hover:bg-accent/10 rounded-lg transition-colors" title="View"><Eye className="w-4 h-4" /></button>
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit"><Edit className="w-4 h-4" /></button>
                    <button className="p-2 text-destructive hover:bg-red-50 rounded-lg transition-colors" title="Deactivate"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

interface RolesProps {
  userRole: Role;
  setUserRole: (r: Role) => void;
}

export const RolesScreen = ({ userRole, setUserRole }: RolesProps) => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-2">Role & Permission Management</h1>
        <p className="text-muted-foreground">Configure role-based access control</p>
      </div>
      <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">
        <Plus className="w-5 h-5" /> Add New Role
      </button>
    </div>

    <div className="grid grid-cols-5 gap-4">
      {(["Director", "Operations Manager", "Event Manager", "Accountant", "Menu Manager"] as Role[]).map((role) => (
        <button key={role} onClick={() => setUserRole(role)} className={`p-4 rounded-xl border transition-all ${userRole === role ? "bg-accent/10 border-accent text-accent" : "bg-card border-border hover:border-accent/50"}`}>
          <UserCog className="w-6 h-6 mb-2 mx-auto" />
          <p className="text-sm font-medium text-center">{role}</p>
        </button>
      ))}
    </div>

    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="text-lg font-semibold text-primary">Permission Matrix: {userRole}</h3>
        <p className="text-sm text-muted-foreground mt-1">Configure access permissions for this role</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary sticky top-0">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">Module</th>
              {["View", "Create", "Update", "Delete", "Export"].map((h) => (
                <th key={h} className="px-6 py-4 text-center text-sm font-semibold text-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {PERMISSIONS.map((perm, idx) => (
              <tr key={idx} className="hover:bg-secondary/50 transition-colors">
                <td className="px-6 py-4 font-medium text-foreground">{perm.module}</td>
                {[perm.view, perm.create, perm.update, perm.delete, perm.export].map((val, i) => (
                  <td key={i} className="px-6 py-4 text-center">
                    <input type="checkbox" defaultChecked={val} className="w-4 h-4 rounded border-border text-accent focus:ring-accent cursor-pointer" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="p-6 border-t border-border flex justify-end gap-3">
        <button className="px-6 py-2.5 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">Reset to Default</button>
        <button className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all">Save Permissions</button>
      </div>
    </div>
  </div>
);

export const ReportsScreen = () => {
  const monthlyRevenueData = [
    { month: "Jul", revenue: 420 }, { month: "Aug", revenue: 450 }, { month: "Sep", revenue: 580 },
    { month: "Oct", revenue: 520 }, { month: "Nov", revenue: 680 }, { month: "Dec", revenue: 820 }, { month: "Jan", revenue: 950 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-primary mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">View business performance and generate reports</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all"><Download className="w-5 h-5" /> Export PDF</button>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm"><Download className="w-5 h-5" /> Export Excel</button>
        </div>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <div className="flex items-center gap-3 mb-4"><Filter className="w-5 h-5 text-muted-foreground" /><h3 className="font-semibold">Report Filters</h3></div>
        <div className="grid grid-cols-4 gap-4">
          <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
            <option>January 2024</option><option>December 2023</option><option>November 2023</option>
          </select>
          <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
            <option>All Halls</option><option>Diamond Hall</option><option>Ruby Hall</option><option>Sapphire Hall</option>
          </select>
          <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
            <option>All Status</option><option>Confirmed</option><option>Completed</option><option>Cancelled</option>
          </select>
          <button className="px-4 py-3 bg-accent text-accent-foreground rounded-xl hover:bg-accent/90 transition-all">Generate Report</button>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {[
          { icon: DollarSign, label: "Total Revenue", value: "950.5M VND", change: "+15.3% vs last month", up: true },
          { icon: CalendarCheck, label: "Completed Events", value: "42", change: "+6 from last month", up: true },
          { icon: Percent, label: "Average Occupancy", value: "73%", change: "-2% from last month", up: false },
          { icon: AlertCircle, label: "Cancellations", value: "3", change: "5.2% cancellation rate", up: null },
        ].map(({ icon: Icon, label, value, change, up }) => (
          <div key={label} className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
            <Icon className={`w-8 h-8 mb-3 ${up === null ? "text-red-600" : up ? "text-accent" : "text-accent"}`} />
            <p className="text-sm text-muted-foreground mb-1">{label}</p>
            <h3 className="text-2xl font-semibold text-primary mb-1">{value}</h3>
            <p className={`text-xs ${up === true ? "text-green-600" : up === false ? "text-red-600" : "text-muted-foreground"}`}>{change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-4">Monthly Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0dbd5" />
              <XAxis dataKey="month" stroke="#6b6b7e" />
              <YAxis stroke="#6b6b7e" />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e0dbd5", borderRadius: "12px" }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" stroke="#c9a961" strokeWidth={3} dot={{ fill: "#c9a961", r: 5 }} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-4">Hall Performance Comparison</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={[{ hall: "Diamond", bookings: 18, revenue: 420 }, { hall: "Sapphire", bookings: 14, revenue: 380 }, { hall: "Ruby", bookings: 10, revenue: 150 }]}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0dbd5" />
              <XAxis dataKey="hall" stroke="#6b6b7e" />
              <YAxis stroke="#6b6b7e" />
              <Tooltip contentStyle={{ backgroundColor: "#ffffff", border: "1px solid #e0dbd5", borderRadius: "12px" }} />
              <Legend />
              <Bar dataKey="bookings" name="Bookings" fill="#1a1a2e" radius={[8, 8, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="revenue" name="Revenue" fill="#c9a961" radius={[8, 8, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-4">VAT & Invoice Summary</h3>
        <div className="grid grid-cols-4 gap-6">
          {[
            { label: "Total Invoiced", value: formatVND(950000000) },
            { label: "Total VAT Collected", value: formatVND(95000000), accent: true },
            { label: "Invoices Generated", value: "42" },
            { label: "Pending Invoices", value: "8", amber: true },
          ].map(({ label, value, accent, amber }) => (
            <div key={label} className="p-4 bg-secondary rounded-xl">
              <p className="text-sm text-muted-foreground mb-2">{label}</p>
              <p className={`text-xl font-semibold font-mono ${accent ? "text-accent" : amber ? "text-amber-600" : "text-foreground"}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const AuditScreen = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold text-primary mb-2">Audit Logs</h1>
        <p className="text-muted-foreground">System activity and change history</p>
      </div>
      <button className="flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">
        <Download className="w-5 h-5" /> Export Logs
      </button>
    </div>

    <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
      <div className="flex items-center gap-3 mb-4"><Filter className="w-5 h-5 text-muted-foreground" /><h3 className="font-semibold">Filter Logs</h3></div>
      <div className="grid grid-cols-5 gap-4">
        <input type="date" className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
        <input type="date" className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
        <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
          <option>All Actions</option><option>CREATE</option><option>UPDATE</option><option>DELETE</option><option>LOGIN</option>
        </select>
        <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
          <option>All Modules</option><option>Booking</option><option>Hall</option><option>Payment</option>
        </select>
        <select className="px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
          <option>All Users</option>
        </select>
      </div>
    </div>

    <div className="bg-card rounded-[20px] border border-border shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary sticky top-0">
            <tr>
              {["Timestamp", "Actor", "Action", "Module", "Detail", "IP Address"].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-foreground">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {AUDIT_LOGS.map((log) => {
              const actionColor = log.action === "CREATE" ? "bg-green-100 text-green-800" : log.action === "UPDATE" ? "bg-blue-100 text-blue-800" : "bg-red-100 text-red-800";
              return (
                <tr key={log.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{log.timestamp}</td>
                  <td className="px-6 py-4 text-sm font-medium text-foreground">{log.actor}</td>
                  <td className="px-6 py-4"><span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${actionColor}`}>{log.action}</span></td>
                  <td className="px-6 py-4 text-sm text-foreground">{log.module}</td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">{log.detail}</td>
                  <td className="px-6 py-4 text-sm font-mono text-muted-foreground">{log.ip}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

export const SettingsScreen = () => (
  <div className="space-y-6">
    <div>
      <h1 className="text-3xl font-semibold text-primary mb-2">System Configuration</h1>
      <p className="text-muted-foreground">Manage system settings and preferences</p>
    </div>

    <div className="grid grid-cols-2 gap-6">
      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-4">Business Information</h3>
        <div className="space-y-4">
          {[
            { label: "Business Name", value: "Wedding Center Management" },
            { label: "Tax ID", value: "0123456789" },
            { label: "Contact Phone", value: "(028) 1234 5678" },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-sm font-medium text-foreground mb-2">{label}</label>
              <input type="text" defaultValue={value} className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
            </div>
          ))}
        </div>
      </div>

      <div className="bg-card rounded-[20px] p-6 border border-border shadow-sm">
        <h3 className="text-lg font-semibold text-primary mb-4">VAT & Pricing</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">VAT Rate (%)</label>
            <input type="number" defaultValue="10" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Default Deposit Percentage (%)</label>
            <input type="number" defaultValue="30" className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Currency</label>
            <select className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-accent">
              <option>VND - Vietnamese Dong</option>
              <option>USD - US Dollar</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-end gap-3">
      <button className="px-6 py-3 border border-border text-foreground rounded-xl hover:bg-secondary transition-all">Cancel</button>
      <button className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all shadow-sm">Save Settings</button>
    </div>
  </div>
);
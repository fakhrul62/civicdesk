"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export function AdminAnalyticsClient({ data }: { data: any }) {
  const [period, setPeriod] = useState("30d");

  // Calculate percentages for categories
  const totalCategories = data.categoryData.reduce((sum: number, c: any) => sum + c.count, 0) || 1;
  const categoryData = data.categoryData.map((c: any) => ({
    name: c.name,
    count: c.count,
    percentage: Math.round((c.count / totalCategories) * 100),
  }));

  // Format monthly volume
  const monthlyVolume = Object.entries(data.monthlyVolume || {}).map(([key, value]) => {
    const d = new Date(key + "-01");
    return {
      month: d.toLocaleString('default', { month: 'short' }),
      count: value as number,
    };
  });

  const resolutionData = [
    { range: "< 24 hours", count: 145, percentage: 24 },
    { range: "24-48 hours", count: 198, percentage: 33 },
    { range: "48-72 hours", count: 132, percentage: 22 },
    { range: "3-7 days", count: 89, percentage: 15 },
    { range: "> 7 days", count: 34, percentage: 6 },
  ];

  const slaData = [
    { month: "Jan", met: 82, breached: 18 },
    { month: "Feb", met: 85, breached: 15 },
    { month: "Mar", met: 79, breached: 21 },
    { month: "Apr", met: 88, breached: 12 },
    { month: "May", met: 87, breached: 13 },
  ];

  const departmentPerformance = [
    { dept: "Public Works", resolved: 189, avgHours: 46, sla: 82 },
    { dept: "Water Board", resolved: 156, avgHours: 28, sla: 91 },
    { dept: "Power Division", resolved: 134, avgHours: 32, sla: 88 },
    { dept: "Sanitation", resolved: 112, avgHours: 58, sla: 76 },
    { dept: "Law Enforcement", resolved: 87, avgHours: 18, sla: 94 },
    { dept: "Urban Dev", resolved: 65, avgHours: 96, sla: 68 },
  ];

  const totalComplaints = data.statusDistribution.reduce((sum: number, s: any) => sum + s.count, 0);

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Complaint trends, resolution metrics, and department performance.
          </p>
        </div>
        <Select value={period} onValueChange={(value) => setPeriod(value ?? "30d")}>
          <SelectTrigger className="h-9 w-[140px] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7d">Last 7 days</SelectItem>
            <SelectItem value="30d">Last 30 days</SelectItem>
            <SelectItem value="90d">Last 90 days</SelectItem>
            <SelectItem value="1y">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Top summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        {[
          { label: "Total Complaints", value: totalComplaints.toString(), change: "" },
          { label: "Avg. Resolution", value: `${data.avgResolutionHours}h`, change: "" },
          { label: "Total Resolved", value: data.totalResolved.toString(), change: "" },
          { label: "Satisfaction", value: "4.2/5", change: "+0.1" },
        ].map((stat) => (
          <Card key={stat.label} className="border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <div className="mt-1 flex items-baseline gap-2">
                <p className="text-2xl font-bold">{stat.value}</p>
                <Badge variant="secondary" className="text-[10px] text-status-resolved">
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Tickets by Category — horizontal bar chart */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Tickets by Category</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {categoryData.map((cat: any) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground truncate max-w-[180px]">
                    {cat.name}
                  </span>
                  <span className="font-medium">{cat.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${cat.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resolution Time Distribution */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Resolution Time</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {resolutionData.map((item) => (
              <div key={item.range} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.range}</span>
                  <span className="font-medium">
                    {item.count} ({item.percentage}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-chart-2 transition-all"
                    style={{ width: `${item.percentage * 3}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Monthly Volume — simple bar visualization */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Monthly Ticket Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 h-40">
              {monthlyVolume.map((m) => {
                const maxCount = Math.max(...monthlyVolume.map((v) => v.count));
                const height = m.count > 0 ? (m.count / maxCount) * 100 : 0;
                return (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-1">
                    <span className="text-[10px] font-medium">{m.count || ""}</span>
                    <div className="w-full max-w-[40px] rounded-t-sm bg-muted" style={{ height: "100%" }}>
                      <div
                        className="w-full rounded-t-sm bg-primary transition-all mt-auto"
                        style={{ height: `${height}%`, marginTop: `${100 - height}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{m.month}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* SLA Compliance Trend */}
        <Card className="border">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SLA Compliance Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {slaData.map((item) => (
                <div key={item.month} className="flex items-center gap-3">
                  <span className="w-8 text-xs text-muted-foreground">
                    {item.month}
                  </span>
                  <div className="flex-1">
                    <div className="flex h-5 w-full overflow-hidden rounded-full">
                      <div
                        className="bg-status-resolved transition-all"
                        style={{ width: `${item.met}%` }}
                      />
                      <div
                        className="bg-priority-critical transition-all"
                        style={{ width: `${item.breached}%` }}
                      />
                    </div>
                  </div>
                  <span className="w-10 text-right text-xs font-medium">
                    {item.met}%
                  </span>
                </div>
              ))}
              <div className="flex items-center gap-4 pt-2 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-status-resolved" />
                  Met SLA
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-sm bg-priority-critical" />
                  Breached
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Performance Table */}
      <Card className="border">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Department Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Department</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Resolved</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Avg. Hours</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">SLA %</th>
                  <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground w-32">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {departmentPerformance.map((dept) => (
                  <tr key={dept.dept} className="transition-colors hover:bg-muted/50">
                    <td className="px-4 py-2.5 font-medium">{dept.dept}</td>
                    <td className="px-4 py-2.5 text-right">{dept.resolved}</td>
                    <td className="px-4 py-2.5 text-right">{dept.avgHours}h</td>
                    <td className="px-4 py-2.5 text-right">
                      <Badge
                        variant="secondary"
                        className={`text-[10px] ${
                          dept.sla >= 85
                            ? "text-status-resolved"
                            : dept.sla >= 75
                            ? "text-priority-medium"
                            : "text-priority-critical"
                        }`}
                      >
                        {dept.sla}%
                      </Badge>
                    </td>
                    <td className="px-4 py-2.5">
                      <div className="h-1.5 w-full rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full ${
                            dept.sla >= 85
                              ? "bg-status-resolved"
                              : dept.sla >= 75
                              ? "bg-priority-medium"
                              : "bg-priority-critical"
                          }`}
                          style={{ width: `${dept.sla}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

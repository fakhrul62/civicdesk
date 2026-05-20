"use client";

import Link from "next/link";
import {
  Ticket,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Users,
  Timer,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getStatusLabel,
  getStatusColor,
  getPriorityColor,
  getPriorityLabel,
  timeAgo,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const summaryCards = [
  {
    label: "Total Tickets",
    value: "847",
    change: "+12%",
    icon: Ticket,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Open Tickets",
    value: "124",
    change: "-3%",
    icon: Clock,
    color: "text-status-under-review",
    bg: "bg-status-under-review/10",
  },
  {
    label: "Resolved",
    value: "598",
    change: "+18%",
    icon: CheckCircle2,
    color: "text-status-resolved",
    bg: "bg-status-resolved/10",
  },
  {
    label: "Overdue",
    value: "36",
    change: "+5%",
    icon: AlertTriangle,
    color: "text-priority-critical",
    bg: "bg-priority-critical/10",
  },
];

// Removed mock recent tickets

const statusDistribution = [
  { label: "Submitted", count: 42, percentage: 34, color: "bg-status-submitted" },
  { label: "Under Review", count: 28, percentage: 23, color: "bg-status-under-review" },
  { label: "In Progress", count: 89, percentage: 72, color: "bg-status-in-progress" },
  { label: "Pending", count: 15, percentage: 12, color: "bg-status-pending" },
  { label: "Resolved", count: 598, percentage: 100, color: "bg-status-resolved" },
];

export function AdminDashboardClient({ stats, agentStats }: { stats: any, agentStats: any[] }) {
  const summaryCards = [
    {
      label: "Total Tickets",
      value: stats.totalTickets.toString(),
      change: "+12%",
      icon: Ticket,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "Open Tickets",
      value: stats.openTickets.toString(),
      change: "-3%",
      icon: Clock,
      color: "text-status-under-review",
      bg: "bg-status-under-review/10",
    },
    {
      label: "Resolved",
      value: stats.resolvedTickets.toString(),
      change: "+18%",
      icon: CheckCircle2,
      color: "text-status-resolved",
      bg: "bg-status-resolved/10",
    },
    {
      label: "Overdue",
      value: stats.overdueTickets.toString(),
      change: "+5%",
      icon: AlertTriangle,
      color: "text-priority-critical",
      bg: "bg-priority-critical/10",
    },
  ];

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of all civic complaints and system performance.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <Card key={card.label} className="border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className={cn("flex h-9 w-9 items-center justify-center rounded-lg", card.bg)}>
                  <card.icon className={cn("h-4 w-4", card.color)} />
                </div>
                <Badge
                  variant="secondary"
                  className={cn(
                    "text-[10px] font-medium",
                    card.change.startsWith("+") && card.label !== "Overdue"
                      ? "text-status-resolved"
                      : "text-priority-critical"
                  )}
                >
                  {card.change}
                </Badge>
              </div>
              <p className="mt-3 text-2xl font-bold">{card.value}</p>
              <p className="text-xs text-muted-foreground">{card.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent tickets */}
        <Card className="border lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base">Recent Tickets</CardTitle>
            <Link href="/admin/tickets">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                View All
                <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y">
              {stats.recentTickets.map((ticket: any) => (
                <Link
                  key={ticket.id}
                  href={`/admin/tickets/${ticket.id}`}
                  className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-mono text-muted-foreground">
                        {ticket.ticket_number}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] h-5", getStatusColor(ticket.status))}
                      >
                        {getStatusLabel(ticket.status)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn("text-[10px] h-5", getPriorityColor(ticket.priority))}
                      >
                        {getPriorityLabel(ticket.priority)}
                      </Badge>
                    </div>
                    <h4 className="mt-1 text-sm font-medium truncate">
                      {ticket.title}
                    </h4>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {ticket.citizen?.full_name} · {ticket.category?.name} · {timeAgo(ticket.updated_at)}
                    </p>
                  </div>
                  <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="space-y-6">
          {/* Status distribution */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Status Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusDistribution.map((item) => (
                <div key={item.label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-medium">{item.count}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={cn("h-full rounded-full", item.color)}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Agent performance */}
          <Card className="border">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Agent Load</CardTitle>
              <Link href="/admin/agents">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  View All
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {agentStats.slice(0, 5).map((agent) => (
                <div
                  key={agent.id}
                  className="flex items-center gap-3 rounded-md border p-2.5"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                    {(agent.full_name || agent.name || "U").split(" ").map((n: string) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{agent.full_name || agent.name}</p>
                    <div className="flex gap-2 text-[10px] text-muted-foreground">
                      <span>{agent.open} open</span>
                      <span>·</span>
                      <span>{agent.inProgress} active</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold">{agent.resolved}</p>
                    <p className="text-[10px] text-muted-foreground">resolved</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick metrics */}
          <Card className="border">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Performance</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                  <Timer className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Avg. Resolution</p>
                  <p className="text-sm font-bold">52 hours</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-resolved/10">
                  <TrendingUp className="h-4 w-4 text-status-resolved" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">SLA Compliance</p>
                  <p className="text-sm font-bold">87%</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-status-under-review/10">
                  <Users className="h-4 w-4 text-status-under-review" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground">Citizen Satisfaction</p>
                  <p className="text-sm font-bold">4.2 / 5.0</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

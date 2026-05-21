"use client";

import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Plus,
  ArrowRight,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  timeAgo,
} from "@/lib/mock-data"; // keeping only the utility functions from mock-data
import { cn } from "@/lib/utils";
import { useState } from "react";

export function DashboardClient({ user, initialTickets }: { user: any, initialTickets: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = initialTickets.filter(
    (t) =>
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const quickStats = [
    {
      label: "Total Complaints",
      value: initialTickets.length,
      icon: FileText,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      label: "In Progress",
      value: initialTickets.filter((t) => t.status === "in_progress").length,
      icon: Clock,
      color: "text-status-in-progress",
      bg: "bg-status-in-progress/10",
    },
    {
      label: "Resolved",
      value: initialTickets.filter(
        (t) => t.status === "resolved" || t.status === "closed"
      ).length,
      icon: CheckCircle2,
      color: "text-status-resolved",
      bg: "bg-status-resolved/10",
    },
    {
      label: "Overdue",
      value: initialTickets.filter(
        (t) =>
          t.due_date && new Date(t.due_date) < new Date() &&
          t.status !== "resolved" &&
          t.status !== "closed"
      ).length,
      icon: AlertTriangle,
      color: "text-priority-high",
      bg: "bg-priority-high/10",
    },
  ];

  return (
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Header */}
          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Welcome back,</p>
              <h1 className="text-2xl font-bold tracking-tight">
                {user.full_name}
              </h1>
            </div>
            <Link href="/submit">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Complaint
              </Button>
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {quickStats.map((stat) => (
              <Card key={stat.label} className="border">
                <CardContent className="flex items-center gap-3 p-4">
                  <div
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                      stat.bg
                    )}
                  >
                    <stat.icon className={cn("h-4 w-4", stat.color)} />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">
                      {stat.label}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Complaints list */}
          <Card className="border">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <CardTitle className="text-base">My Complaints</CardTitle>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                  <Input
                    placeholder="Search complaints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="h-9 pl-8 text-sm"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filtered.map((ticket) => (
                  <Link
                    key={ticket.id}
                    href={`/complaints/${ticket.id}`}
                    className="flex items-start gap-4 p-4 transition-colors hover:bg-muted/50 sm:items-center"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          {ticket.ticket_number}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            getStatusColor(ticket.status)
                          )}
                        >
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px]",
                            getPriorityColor(ticket.priority)
                          )}
                        >
                          {getPriorityLabel(ticket.priority)}
                        </Badge>
                      </div>
                      <h3 className="mt-1 text-sm font-medium truncate">
                        {ticket.title}
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <span>{ticket.category?.name}</span>
                        <span>·</span>
                        <span>{timeAgo(ticket.updated_at)}</span>
                        {ticket.assigned_agent?.full_name && (
                          <>
                            <span>·</span>
                            <span>Agent: {ticket.assigned_agent.full_name}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground sm:mt-0" />
                  </Link>
                ))}

                {filtered.length === 0 && (
                  <div className="p-8 text-center text-sm text-muted-foreground">
                    No complaints found matching your search.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
  );
}

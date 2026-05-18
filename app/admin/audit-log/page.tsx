"use client";

import { useState } from "react";
import { Search, ScrollText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  mockAuditLog,
  formatDateTime,
} from "@/lib/mock-data";

export default function AdminAuditLogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("all");

  const filtered = mockAuditLog.filter((entry) => {
    const matchesSearch =
      entry.actor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction =
      actionFilter === "all" ||
      entry.action.toLowerCase().includes(actionFilter.toLowerCase());
    return matchesSearch && matchesAction;
  });

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Audit Log</h1>
        <p className="text-sm text-muted-foreground">
          Immutable record of every action taken in the system.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search by actor, ticket, action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[170px] text-sm">
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="created">Ticket Created</SelectItem>
            <SelectItem value="status">Status Changed</SelectItem>
            <SelectItem value="assigned">Assigned Agent</SelectItem>
            <SelectItem value="priority">Priority Changed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Log entries */}
      <Card className="border">
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((entry) => (
              <div
                key={entry.id}
                className="flex items-start gap-3 p-4 transition-colors hover:bg-muted/50"
              >
                {/* Avatar */}
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">
                  {entry.actor_name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{entry.actor_name}</span>{" "}
                    <span className="text-muted-foreground">{entry.action}</span>
                  </p>

                  <div className="mt-1 flex flex-wrap items-center gap-2">
                    <Badge variant="secondary" className="text-[10px] font-mono">
                      {entry.ticket_number}
                    </Badge>

                    {(entry.old_value || entry.new_value) && (
                      <div className="flex items-center gap-1.5 text-xs">
                        {entry.old_value && (
                          <Badge
                            variant="outline"
                            className="text-[10px] line-through opacity-60"
                          >
                            {entry.old_value}
                          </Badge>
                        )}
                        {entry.old_value && entry.new_value && (
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                        )}
                        {entry.new_value && (
                          <Badge variant="outline" className="text-[10px]">
                            {entry.new_value}
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>

                  <p className="mt-1 text-[10px] text-muted-foreground">
                    {formatDateTime(entry.created_at)}
                  </p>
                </div>

                {/* Action type badge */}
                <Badge
                  variant="secondary"
                  className="shrink-0 text-[10px] hidden sm:inline-flex"
                >
                  {entry.action.includes("Status")
                    ? "Status"
                    : entry.action.includes("Assigned")
                    ? "Assignment"
                    : entry.action.includes("Priority")
                    ? "Priority"
                    : "System"}
                </Badge>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">
                <ScrollText className="mx-auto h-8 w-8 mb-2 text-muted-foreground/50" />
                No audit log entries found.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          Showing {filtered.length} of {mockAuditLog.length} entries
        </span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="h-7 text-xs">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

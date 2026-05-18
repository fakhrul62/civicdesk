"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Circle,
  ArrowRight,
  MapPin,
  Calendar,
  Tag,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import {
  mockTickets,
  mockTimeline,
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  formatDateTime,
  type TicketStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const statusOrder: TicketStatus[] = [
  "submitted",
  "under_review",
  "in_progress",
  "pending_citizen",
  "resolved",
  "closed",
];

function getStatusIcon(status: TicketStatus) {
  switch (status) {
    case "submitted":
      return Circle;
    case "under_review":
      return Clock;
    case "in_progress":
      return ArrowRight;
    case "pending_citizen":
      return AlertCircle;
    case "resolved":
      return CheckCircle2;
    case "closed":
      return CheckCircle2;
    default:
      return Circle;
  }
}

function TrackContent() {
  const searchParams = useSearchParams();
  const initialId = searchParams.get("id") || "";
  const [ticketId, setTicketId] = useState(initialId);
  const [searched, setSearched] = useState(!!initialId);

  const ticket = searched
    ? mockTickets.find(
        (t) => t.ticket_number.toLowerCase() === ticketId.toLowerCase()
      )
    : null;

  const handleSearch = () => {
    if (ticketId.trim()) {
      setSearched(true);
    }
  };

  const currentStatusIndex = ticket
    ? statusOrder.indexOf(ticket.status)
    : -1;

  return (
    <main className="flex-1 py-8 sm:py-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Track Your Complaint
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your ticket ID to check the current status.
          </p>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="flex items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm">
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter ticket ID (e.g. CVD-2026-0001)"
                value={ticketId}
                onChange={(e) => {
                  setTicketId(e.target.value);
                  setSearched(false);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <Button size="sm" onClick={handleSearch}>
              Track
            </Button>
          </div>
        </div>

        {/* Results */}
        {searched && !ticket && (
          <Card className="border text-center">
            <CardContent className="flex flex-col items-center gap-3 p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h3 className="font-semibold">Ticket Not Found</h3>
              <p className="text-sm text-muted-foreground">
                No complaint found with ticket ID &quot;{ticketId}&quot;.
                Please check the ID and try again.
              </p>
            </CardContent>
          </Card>
        )}

        {searched && ticket && (
          <div className="space-y-6">
            {/* Ticket info */}
            <Card className="border">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      {ticket.ticket_number}
                    </p>
                    <CardTitle className="mt-1 text-lg">
                      {ticket.title}
                    </CardTitle>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn("shrink-0", getStatusColor(ticket.status))}
                  >
                    {getStatusLabel(ticket.status)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {ticket.description}
                </p>

                <Separator className="my-4" />

                <div className="grid gap-3 text-sm sm:grid-cols-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Tag className="h-3.5 w-3.5" />
                    <span>Category:</span>
                    <span className="font-medium text-foreground">
                      {ticket.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>Location:</span>
                    <span className="font-medium text-foreground">
                      {ticket.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>Submitted:</span>
                    <span className="font-medium text-foreground">
                      {formatDateTime(ticket.created_at)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span>Assigned:</span>
                    <span className="font-medium text-foreground">
                      {ticket.assigned_agent_name || "Pending assignment"}
                    </span>
                  </div>
                </div>

                <div className="mt-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs",
                      getPriorityColor(ticket.priority)
                    )}
                  >
                    {getPriorityLabel(ticket.priority)} Priority
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Status progress bar */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Status Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  {statusOrder.slice(0, -1).map((status, i) => {
                    const isCompleted = i <= currentStatusIndex;
                    const isCurrent = i === currentStatusIndex;
                    const StatusIcon = getStatusIcon(status);

                    return (
                      <div key={status} className="flex flex-1 items-center">
                        <div className="flex flex-col items-center gap-1">
                          <div
                            className={cn(
                              "flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors",
                              isCompleted
                                ? "border-primary bg-primary text-primary-foreground"
                                : "border-muted-foreground/25 text-muted-foreground"
                            )}
                          >
                            <StatusIcon className="h-3 w-3" />
                          </div>
                          <span
                            className={cn(
                              "text-[10px] font-medium text-center max-w-[60px]",
                              isCurrent
                                ? "text-primary"
                                : isCompleted
                                ? "text-foreground"
                                : "text-muted-foreground"
                            )}
                          >
                            {getStatusLabel(status)}
                          </span>
                        </div>
                        {i < statusOrder.length - 2 && (
                          <div
                            className={cn(
                              "mx-1 h-px flex-1",
                              i < currentStatusIndex
                                ? "bg-primary"
                                : "bg-border"
                            )}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {(ticket.ticket_number === "CVD-2026-0001"
                    ? mockTimeline
                    : [
                        {
                          id: "gen-1",
                          status: "submitted" as TicketStatus,
                          description: "Complaint submitted by citizen",
                          actor: ticket.citizen_name,
                          created_at: ticket.created_at,
                        },
                      ]
                  ).map((event, i, arr) => (
                    <div key={event.id} className="flex gap-3">
                      {/* Vertical line + dot */}
                      <div className="flex flex-col items-center">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                          <Circle className="h-2 w-2 fill-primary text-primary" />
                        </div>
                        {i < arr.length - 1 && (
                          <div className="w-px flex-1 bg-border" />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-medium">
                          {event.description}
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {event.actor} · {formatDateTime(event.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </main>
  );
}

export default function TrackPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <Suspense fallback={<div className="flex-1" />}>
        <TrackContent />
      </Suspense>
      <Footer />
    </div>
  );
}

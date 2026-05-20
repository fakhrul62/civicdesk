import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  MapPin,
  Paperclip,
  Search,
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
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  formatDateTime,
  type TicketStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { getTicketByNumber } from "@/actions/tickets";

export const dynamic = "force-dynamic";

const statusOrder: TicketStatus[] = [
  "submitted",
  "under_review",
  "in_progress",
  "pending_citizen",
  "resolved",
  "closed",
];

function StatusIcon({ status }: { status: TicketStatus }) {
  if (status === "resolved" || status === "closed") {
    return <CheckCircle2 className="h-3 w-3" />;
  }
  if (status === "under_review" || status === "pending_citizen") {
    return <Clock className="h-3 w-3" />;
  }
  return <Circle className="h-3 w-3" />;
}

function formatStoredDate(value: Date | string) {
  return formatDateTime(value instanceof Date ? value.toISOString() : value);
}

export default async function TrackPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id = "" } = await searchParams;
  const ticketNumber = id.trim();
  const ticket = ticketNumber ? await getTicketByNumber(ticketNumber) : null;
  const searched = Boolean(ticketNumber);
  const currentStatusIndex = ticket ? statusOrder.indexOf(ticket.status) : -1;

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-2xl px-4 sm:px-6">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight">Track Your Complaint</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Enter your ticket ID to check live status, messages, timeline, and files.
            </p>
          </div>

          <form className="mb-8 flex items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm">
            <div className="flex flex-1 items-center gap-2 px-2">
              <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input
                name="id"
                type="text"
                placeholder="Enter your ticket ID"
                defaultValue={ticketNumber}
                className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>
            <Button size="sm" type="submit">Track</Button>
          </form>

          {searched && !ticket && (
            <Card className="border text-center">
              <CardContent className="flex flex-col items-center gap-3 p-8">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                  <AlertCircle className="h-6 w-6 text-destructive" />
                </div>
                <h3 className="font-semibold">Ticket Not Found</h3>
                <p className="text-sm text-muted-foreground">
                  No complaint found with ticket ID "{ticketNumber}". Please check the ID and try again.
                </p>
              </CardContent>
            </Card>
          )}

          {ticket && (
            <div className="space-y-6">
              <Card className="border">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground">{ticket.ticket_number}</p>
                      <CardTitle className="mt-1 text-lg">{ticket.title}</CardTitle>
                    </div>
                    <Badge variant="outline" className={cn("shrink-0", getStatusColor(ticket.status))}>
                      {getStatusLabel(ticket.status)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
                  <Separator className="my-4" />
                  <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Category:</span>
                      <span className="font-medium text-foreground">{ticket.category?.name || "Uncategorized"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>Location:</span>
                      <span className="font-medium text-foreground">{ticket.location || "Not specified"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Submitted:</span>
                      <span className="font-medium text-foreground">{formatStoredDate(ticket.created_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      <span>Assigned:</span>
                      <span className="font-medium text-foreground">{ticket.assigned_agent?.full_name || "Pending assignment"}</span>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge variant="outline" className={cn("text-xs", getPriorityColor(ticket.priority))}>
                      {getPriorityLabel(ticket.priority)} Priority
                    </Badge>
                    {ticket.latitude && ticket.longitude && (
                      <Button type="button" variant="outline" size="sm" asChild className="h-7 gap-1.5 text-xs">
                        <a href={`https://www.openstreetmap.org/?mlat=${ticket.latitude}&mlon=${ticket.longitude}#map=17/${ticket.latitude}/${ticket.longitude}`} target="_blank" rel="noreferrer">
                          <MapPin className="h-3 w-3" />
                          View Map
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Status Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    {statusOrder.slice(0, -1).map((status, i) => {
                      const isCompleted = i <= currentStatusIndex;
                      const isCurrent = i === currentStatusIndex;
                      return (
                        <div key={status} className="flex flex-1 items-center">
                          <div className="flex flex-col items-center gap-1">
                            <div className={cn("flex h-7 w-7 items-center justify-center rounded-full border-2 transition-colors", isCompleted ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/25 text-muted-foreground")}>
                              <StatusIcon status={status} />
                            </div>
                            <span className={cn("max-w-[60px] text-center text-[10px] font-medium", isCurrent ? "text-primary" : isCompleted ? "text-foreground" : "text-muted-foreground")}>
                              {getStatusLabel(status)}
                            </span>
                          </div>
                          {i < statusOrder.length - 2 && (
                            <div className={cn("mx-1 h-px flex-1", i < currentStatusIndex ? "bg-primary" : "bg-border")} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  {ticket.timeline_events.length > 0 ? (
                    ticket.timeline_events.map((event, i, arr) => (
                      <div key={event.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                            <Circle className="h-2 w-2 fill-primary text-primary" />
                          </div>
                          {i < arr.length - 1 && <div className="w-px flex-1 bg-border" />}
                        </div>
                        <div className="pb-6">
                          <p className="text-sm font-medium">{event.description}</p>
                          <p className="mt-0.5 text-xs text-muted-foreground">
                            {event.actor} · {formatStoredDate(event.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-4 text-center text-sm text-muted-foreground">No timeline activity found.</div>
                  )}
                </CardContent>
              </Card>

              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Public Messages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {ticket.messages.length > 0 ? (
                    ticket.messages.map((message) => (
                      <div key={message.id} className="rounded-lg border p-3">
                        <p className="text-sm">{message.body}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {message.sender.full_name} · {formatStoredDate(message.created_at)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No public messages yet.</p>
                  )}
                </CardContent>
              </Card>

              {ticket.attachments.length > 0 && (
                <Card className="border">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Attachments</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-2 sm:grid-cols-2">
                    {ticket.attachments.map((file) => (
                      <a key={file.id} href={file.file_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 rounded-md border p-3 text-sm hover:bg-muted">
                        {file.mime_type.startsWith("image/") ? <FileText className="h-4 w-4 text-primary" /> : <Paperclip className="h-4 w-4 text-primary" />}
                        <span className="truncate">{file.file_name}</span>
                      </a>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

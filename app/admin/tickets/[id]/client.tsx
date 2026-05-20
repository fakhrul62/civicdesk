"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MapPin,
  Tag,
  User,
  Calendar,
  Circle,
  Send,
  Paperclip,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  formatDateTime,
  type TicketStatus,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/actions/messages";
import { updateTicketStatus, updateTicketPriority, assignAgent } from "@/actions/tickets";

type TimelineItem = {
  id: string;
  description: string;
  actor: string;
  created_at: string;
};

export function AdminTicketDetailClient({
  ticket,
  initialMessages,
  auditLogs,
  agents,
  user,
}: {
  ticket: any;
  initialMessages: any[];
  auditLogs: any[];
  agents: any[];
  user: any;
}) {
  const router = useRouter();
  const id = ticket.id;
  const [messages, setMessages] = useState(initialMessages || []);
  const [newMessage, setNewMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [isSending, setIsSending] = useState(false);
  
  const [status, setStatus] = useState<string>(ticket.status || "submitted");
  const [priority, setPriority] = useState<string>(ticket.priority || "medium");
  const [assignedAgent, setAssignedAgent] = useState<string>(ticket.assigned_to || "");
  const [isSaving, setIsSaving] = useState(false);

  const ticketAudit = auditLogs || [];

  const timeline: TimelineItem[] = ticket.timeline_events || [];

  if (!ticket) {
    return (
      <div className="flex items-center justify-center p-12">
        <Card className="w-full max-w-sm border text-center">
          <CardContent className="p-8">
            <h2 className="text-lg font-semibold">Ticket Not Found</h2>
            <Link href="/admin/tickets">
              <Button className="mt-4" variant="outline" size="sm">Back to Tickets</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOverdue = new Date(ticket.due_date) < new Date() && ticket.status !== "resolved" && ticket.status !== "closed";

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    try {
      const { message, error } = await sendMessage({
        ticket_id: id,
        body: newMessage,
        is_internal: isInternal,
      });

      if (message && !error) {
        setMessages((prev: any[]) => [...prev, message]);
        setNewMessage("");
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveChanges = async () => {
    setIsSaving(true);
    try {
      if (status !== ticket.status) {
        await updateTicketStatus({ ticket_id: id, status: status as any });
      }
      if (priority !== ticket.priority) {
        await updateTicketPriority({ ticket_id: id, priority: priority as any });
      }
      if (assignedAgent && assignedAgent !== ticket.assigned_to) {
        await assignAgent({ ticket_id: id, agent_id: assignedAgent });
      }
      router.refresh();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Back + Header */}
      <div>
        <Link href="/admin/tickets" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Tickets
        </Link>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">{ticket.ticket_number}</span>
              <Badge variant="outline" className={cn("text-xs", getStatusColor(ticket.status))}>{getStatusLabel(ticket.status)}</Badge>
              <Badge variant="outline" className={cn("text-xs", getPriorityColor(ticket.priority))}>{getPriorityLabel(ticket.priority)}</Badge>
              {isOverdue && (
                <Badge variant="outline" className="gap-1 text-xs border-priority-critical/25 bg-priority-critical/10 text-priority-critical">
                  <AlertTriangle className="h-3 w-3" /> Overdue
                </Badge>
              )}
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight">{ticket.title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Submitted by {ticket.citizen?.full_name} · {ticket.category?.name}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <Card className="border">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">{ticket.description}</p>
            </CardContent>
          </Card>

          {/* Tabs */}
          <Tabs defaultValue="messages">
            <TabsList>
              <TabsTrigger value="messages">Messages</TabsTrigger>
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
              <TabsTrigger value="attachments">Files</TabsTrigger>
            </TabsList>

            <TabsContent value="messages" className="mt-4 space-y-4">
              <div className="space-y-3">
                {messages.map((msg: any) => (
                  <div key={msg.id} className={cn("flex gap-3", msg.sender?.role === "citizen" && "flex-row-reverse")}>
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[10px] bg-primary/10 text-primary">
                        {(msg.sender?.full_name || "Unknown").split(" ").map((n: string) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn("max-w-[80%] rounded-lg border p-3", msg.is_internal ? "border-amber-500/30 bg-amber-500/5" : msg.sender?.role === "citizen" ? "bg-primary/5 border-primary/20" : "bg-card")}>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium">{msg.sender?.full_name || "Unknown"}</span>
                        <Badge variant="secondary" className="text-[10px] h-4 px-1">{msg.sender?.role || "user"}</Badge>
                        {msg.is_internal && <Badge variant="outline" className="text-[10px] h-4 px-1 border-amber-500/30 text-amber-600">Internal</Badge>}
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{msg.body}</p>
                      <p className="mt-1.5 text-[10px] text-muted-foreground/60">{formatDateTime(msg.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Reply box */}
              <div className="rounded-lg border bg-card p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Button variant={!isInternal ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setIsInternal(false)}>Public Reply</Button>
                  <Button variant={isInternal ? "default" : "outline"} size="sm" className="h-7 text-xs" onClick={() => setIsInternal(true)}>Internal Note</Button>
                </div>
                <Textarea placeholder={isInternal ? "Write an internal note (not visible to citizen)..." : "Write a public reply..."} rows={3} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 resize-none" />
                <div className="mt-2 flex items-center justify-between">
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Paperclip className="h-4 w-4" /></Button>
                  <Button size="sm" onClick={handleSend} disabled={isSending} className="gap-1.5"><Send className="h-3.5 w-3.5" /> {isSending ? "Sending..." : "Send"}</Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="timeline" className="mt-4">
              <Card className="border">
                <CardContent className="p-4">
                  {timeline.map((event, i) => (
                    <div key={event.id} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                          <Circle className="h-2 w-2 fill-primary text-primary" />
                        </div>
                        {i < timeline.length - 1 && <div className="w-px flex-1 bg-border" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-medium">{event.description}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">{event.actor || "System"} · {formatDateTime(event.created_at)}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit" className="mt-4">
              <Card className="border">
                <CardContent className="p-0">
                  <div className="divide-y">
                    {ticketAudit.length > 0 ? ticketAudit.map((entry: any) => (
                      <div key={entry.id} className="flex items-start gap-3 p-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-medium">{(entry.actor?.full_name || "System").split(" ").map((n: string) => n[0]).join("")}</div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm"><span className="font-medium">{entry.actor?.full_name || "System"}</span> <span className="text-muted-foreground">{entry.action}</span></p>
                          {(entry.old_value || entry.new_value) && (
                            <div className="mt-1 flex items-center gap-1.5 text-xs">
                              {entry.old_value && <Badge variant="outline" className="text-[10px] line-through opacity-60">{entry.old_value}</Badge>}
                              {entry.old_value && entry.new_value && <span className="text-muted-foreground">→</span>}
                              {entry.new_value && <Badge variant="outline" className="text-[10px]">{entry.new_value}</Badge>}
                            </div>
                          )}
                          <p className="mt-1 text-[10px] text-muted-foreground">{formatDateTime(entry.created_at)}</p>
                        </div>
                      </div>
                    )) : (
                      <div className="p-6 text-center text-sm text-muted-foreground">No audit entries for this ticket.</div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="attachments" className="mt-4">
              <Card className="border">
                <CardContent className="p-6 text-sm text-muted-foreground">
                  {ticket.attachments?.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2">
                      {ticket.attachments.map((file: any) => (
                        <a
                          key={file.id}
                          href={file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 rounded-md border p-3 hover:bg-muted"
                        >
                          <Paperclip className="h-4 w-4 text-primary" />
                          <span className="truncate">{file.file_name}</span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <Paperclip className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50" />
                      <p>No attachments submitted.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          {/* Status changer */}
          <Card className="border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Manage Ticket</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="under_review">Under Review</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="pending_citizen">Pending Citizen</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Assigned Agent</Label>
                <Select value={assignedAgent} onValueChange={setAssignedAgent}>
                  <SelectTrigger className="h-9 text-sm"><SelectValue placeholder="Select agent" /></SelectTrigger>
                  <SelectContent>
                    {agents.map((a: any) => (<SelectItem key={a.id} value={a.id}>{a.full_name}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full" size="sm" onClick={handleSaveChanges} disabled={isSaving}>{isSaving ? "Saving..." : "Save Changes"}</Button>
            </CardContent>
          </Card>

          {/* Ticket info */}
          <Card className="border">
            <CardHeader className="pb-3"><CardTitle className="text-sm">Details</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-start gap-2"><Tag className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Category</p><p className="font-medium">{ticket.category?.name || "Uncategorized"}</p></div></div>
              <div className="flex items-start gap-2"><MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Location</p><p className="font-medium">{ticket.location || "Not specified"}</p>{ticket.latitude && ticket.longitude && <a className="mt-1 inline-flex text-xs text-primary hover:underline" href={`https://www.openstreetmap.org/?mlat=${ticket.latitude}&mlon=${ticket.longitude}#map=17/${ticket.latitude}/${ticket.longitude}`} target="_blank" rel="noreferrer">Open map</a>}</div></div>
              <div className="flex items-start gap-2"><User className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Citizen</p><p className="font-medium">{ticket.citizen?.full_name}</p></div></div>
              <Separator />
              <div className="flex items-start gap-2"><Calendar className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Submitted</p><p className="font-medium">{formatDateTime(ticket.created_at)}</p></div></div>
              <div className="flex items-start gap-2"><Clock className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Due Date</p><p className={cn("font-medium", isOverdue && "text-priority-critical")}>{formatDateTime(ticket.due_date)} {isOverdue && "(Overdue)"}</p></div></div>
              <div className="flex items-start gap-2"><CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" /><div><p className="text-xs text-muted-foreground">Last Updated</p><p className="font-medium">{formatDateTime(ticket.updated_at)}</p></div></div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

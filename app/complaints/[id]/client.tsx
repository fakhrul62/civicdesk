"use client";

import { useState } from "react";
import Link from "next/link";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  formatDateTime,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { sendMessage } from "@/actions/messages";

export function ComplaintDetailClient({ 
  ticket, 
  initialMessages, 
  user,
  auditLogs 
}: { 
  ticket: any, 
  initialMessages: any[], 
  user: any,
  auditLogs: any[]
}) {
  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState(initialMessages);
  const [isSending, setIsSending] = useState(false);

  if (!ticket) {
    return (
        <main className="flex flex-1 items-center justify-center p-4">
          <Card className="w-full max-w-sm border text-center">
            <CardContent className="p-8">
              <h2 className="text-lg font-semibold">Complaint Not Found</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                The complaint you&apos;re looking for doesn&apos;t exist.
              </p>
              <Link href="/dashboard">
                <Button className="mt-4" variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>
        </main>
    );
  }

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;
    setIsSending(true);

    const result = await sendMessage({
      ticket_id: ticket.id,
      body: newMessage,
      is_internal: false,
    });

    if (result.success && result.message) {
      setMessages((prev) => [...prev, result.message]);
      setNewMessage("");
    }
    
    setIsSending(false);
  };

  const timeline = auditLogs.map(log => ({
    id: log.id,
    description: log.action,
    actor: log.actor?.full_name || "System",
    created_at: log.created_at,
  }));

  return (
      <main className="flex-1 py-8 sm:py-12">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          {/* Back */}
          <Link
            href="/dashboard"
            className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Dashboard
          </Link>

          {/* Header */}
          <div className="mb-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-mono text-muted-foreground">
                {ticket.ticket_number}
              </span>
              <Badge
                variant="outline"
                className={cn("text-xs", getStatusColor(ticket.status))}
              >
                {getStatusLabel(ticket.status)}
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-xs", getPriorityColor(ticket.priority))}
              >
                {getPriorityLabel(ticket.priority)}
              </Badge>
            </div>
            <h1 className="mt-2 text-xl font-bold tracking-tight sm:text-2xl">
              {ticket.title}
            </h1>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">
              <Tabs defaultValue="messages">
                <TabsList className="w-full justify-start">
                  <TabsTrigger value="messages">Messages</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="attachments">Attachments</TabsTrigger>
                </TabsList>

                <TabsContent value="messages" className="mt-4 space-y-4">
                  {/* Messages thread */}
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex gap-3",
                          msg.sender?.role === "citizen" && "flex-row-reverse"
                        )}
                      >
                        <Avatar className="h-8 w-8 shrink-0">
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {(msg.sender?.full_name || "U")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg border p-3",
                            msg.sender?.role === "citizen"
                              ? "bg-primary/5 border-primary/20"
                              : "bg-card"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium">
                              {msg.sender?.full_name || "Unknown"}
                            </span>
                            <Badge variant="secondary" className="text-[10px] h-4 px-1">
                              {msg.sender?.role || "user"}
                            </Badge>
                          </div>
                          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            {msg.body}
                          </p>
                          <p className="mt-1.5 text-[10px] text-muted-foreground/60">
                            {formatDateTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply box */}
                  <div className="rounded-lg border bg-card p-3">
                    <Textarea
                      placeholder="Write a reply..."
                      rows={3}
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      className="border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 resize-none"
                    />
                    <div className="mt-2 flex items-center justify-between">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button size="sm" onClick={handleSend} disabled={isSending} className="gap-1.5">
                        <Send className="h-3.5 w-3.5" />
                        {isSending ? "Sending..." : "Send"}
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="timeline" className="mt-4">
                  <Card className="border">
                    <CardContent className="p-4">
                      <div className="space-y-0">
                        {timeline.map((event, i) => (
                          <div key={event.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-primary bg-primary/10">
                                <Circle className="h-2 w-2 fill-primary text-primary" />
                              </div>
                              {i < timeline.length - 1 && (
                                <div className="w-px flex-1 bg-border" />
                              )}
                            </div>
                            <div className="pb-6">
                              <p className="text-sm font-medium">
                                {event.description}
                              </p>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {event.actor} ·{" "}
                                {formatDateTime(event.created_at)}
                              </p>
                            </div>
                          </div>
                        ))}
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

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-start gap-2">
                    <Tag className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Category</p>
                      <p className="font-medium">{ticket.category?.name || "Uncategorized"}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Location</p>
                      <p className="font-medium">{ticket.location || "Not specified"}</p>
                      {ticket.latitude && ticket.longitude && (
                        <a
                          className="mt-1 inline-flex text-xs text-primary hover:underline"
                          href={`https://www.openstreetmap.org/?mlat=${ticket.latitude}&mlon=${ticket.longitude}#map=17/${ticket.latitude}/${ticket.longitude}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          Open map
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <User className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Assigned Agent
                      </p>
                      <p className="font-medium">
                        {ticket.assigned_agent?.full_name || "Pending"}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-start gap-2">
                    <Calendar className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Submitted</p>
                      <p className="font-medium">
                        {formatDateTime(ticket.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Due Date</p>
                      <p className="font-medium">
                        {ticket.due_date ? formatDateTime(ticket.due_date) : "Not set"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Last Updated
                      </p>
                      <p className="font-medium">
                        {formatDateTime(ticket.updated_at)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
  );
}

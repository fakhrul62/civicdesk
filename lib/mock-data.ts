// ============================================================
// CivicDesk shared display types and formatting helpers
// ============================================================

export type TicketStatus =
  | "submitted"
  | "under_review"
  | "in_progress"
  | "pending_citizen"
  | "resolved"
  | "closed";

export type Priority = "critical" | "high" | "medium" | "low";

export type UserRole = "citizen" | "agent" | "supervisor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url: string;
}

export interface Ticket {
  id: string;
  ticket_number: string;
  citizen_id: string;
  citizen_name: string;
  category: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  assigned_to: string | null;
  assigned_agent_name: string | null;
  department: string;
  location: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  due_date: string;
}

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  body: string;
  is_internal: boolean;
  created_at: string;
}

export interface AuditLogEntry {
  id: string;
  ticket_id: string;
  ticket_number: string;
  actor_id: string;
  actor_name: string;
  action: string;
  old_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  department: string;
  default_priority: Priority;
  sla_hours: number;
}

export interface TimelineEvent {
  id: string;
  status: TicketStatus;
  description: string;
  actor: string;
  created_at: string;
}

export function getStatusLabel(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    in_progress: "In Progress",
    pending_citizen: "Pending Citizen",
    resolved: "Resolved",
    closed: "Closed",
  };
  return map[status];
}

export function getPriorityLabel(priority: Priority): string {
  const map: Record<Priority, string> = {
    critical: "Critical",
    high: "High",
    medium: "Medium",
    low: "Low",
  };
  return map[priority];
}

export function getStatusColor(status: TicketStatus): string {
  const map: Record<TicketStatus, string> = {
    submitted: "bg-status-submitted/15 text-status-submitted border-status-submitted/25",
    under_review: "bg-status-under-review/15 text-status-under-review border-status-under-review/25",
    in_progress: "bg-status-in-progress/15 text-status-in-progress border-status-in-progress/25",
    pending_citizen: "bg-status-pending/15 text-status-pending border-status-pending/25",
    resolved: "bg-status-resolved/15 text-status-resolved border-status-resolved/25",
    closed: "bg-status-closed/15 text-status-closed border-status-closed/25",
  };
  return map[status];
}

export function getPriorityColor(priority: Priority): string {
  const map: Record<Priority, string> = {
    critical: "bg-priority-critical/15 text-priority-critical border-priority-critical/25",
    high: "bg-priority-high/15 text-priority-high border-priority-high/25",
    medium: "bg-priority-medium/15 text-priority-medium border-priority-medium/25",
    low: "bg-priority-low/15 text-priority-low border-priority-low/25",
  };
  return map[priority];
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(dateStr);
}

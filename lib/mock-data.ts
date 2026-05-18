// ============================================================
// CivicDesk — Mock Data for Phase 1 UI Development
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

// --- Users ---
export const mockUsers: User[] = [
  { id: "u1", name: "Arif Hossain", email: "arif.hossain@gmail.com", role: "citizen", avatar_url: "" },
  { id: "u2", name: "Fatima Akter", email: "fatima.akter@gmail.com", role: "citizen", avatar_url: "" },
  { id: "u3", name: "Rafiq Uddin", email: "rafiq.uddin@civicdesk.gov", role: "agent", avatar_url: "" },
  { id: "u4", name: "Nasreen Begum", email: "nasreen.begum@civicdesk.gov", role: "agent", avatar_url: "" },
  { id: "u5", name: "Kamal Ahmed", email: "kamal.ahmed@civicdesk.gov", role: "supervisor", avatar_url: "" },
  { id: "u6", name: "Shahida Rahman", email: "shahida.rahman@civicdesk.gov", role: "admin", avatar_url: "" },
  { id: "u7", name: "Mizanur Rahman", email: "mizan.rahman@gmail.com", role: "citizen", avatar_url: "" },
  { id: "u8", name: "Tahmina Khatun", email: "tahmina.k@civicdesk.gov", role: "agent", avatar_url: "" },
];

// --- Categories ---
export const mockCategories: Category[] = [
  { id: "c1", name: "Road & Infrastructure", department: "Public Works", default_priority: "high", sla_hours: 48 },
  { id: "c2", name: "Water Supply", department: "Water Board", default_priority: "critical", sla_hours: 24 },
  { id: "c3", name: "Electricity", department: "Power Division", default_priority: "high", sla_hours: 24 },
  { id: "c4", name: "Waste Management", department: "Sanitation", default_priority: "medium", sla_hours: 72 },
  { id: "c5", name: "Public Safety", department: "Law Enforcement", default_priority: "critical", sla_hours: 12 },
  { id: "c6", name: "Parks & Recreation", department: "Urban Dev", default_priority: "low", sla_hours: 120 },
  { id: "c7", name: "Noise Complaint", department: "Environment", default_priority: "low", sla_hours: 96 },
  { id: "c8", name: "Building Permits", department: "Urban Dev", default_priority: "medium", sla_hours: 168 },
];

// --- Tickets ---
export const mockTickets: Ticket[] = [
  {
    id: "t1", ticket_number: "CVD-2026-0001", citizen_id: "u1", citizen_name: "Arif Hossain",
    category: "Road & Infrastructure", title: "Massive pothole on Mirpur Road near signal intersection",
    description: "There is a pothole roughly 3 feet wide and 8 inches deep on Mirpur Road, just before the Dhanmondi signal. Multiple vehicles have been damaged and two motorcycle accidents occurred last week. This is extremely dangerous, especially at night when visibility is poor.",
    status: "in_progress", priority: "critical", assigned_to: "u3", assigned_agent_name: "Rafiq Uddin",
    department: "Public Works", location: "Mirpur Road, Dhanmondi Signal, Dhaka",
    created_at: "2026-05-10T08:30:00Z", updated_at: "2026-05-15T14:20:00Z", resolved_at: null, due_date: "2026-05-12T08:30:00Z",
  },
  {
    id: "t2", ticket_number: "CVD-2026-0002", citizen_id: "u2", citizen_name: "Fatima Akter",
    category: "Water Supply", title: "No water supply for 5 days in Uttara Sector 7",
    description: "Our entire building at House 12, Road 7, Sector 7, Uttara has had no water supply for the past 5 days. We have contacted the local office multiple times but received no response. Residents are purchasing water from external sources at significant cost.",
    status: "under_review", priority: "critical", assigned_to: "u4", assigned_agent_name: "Nasreen Begum",
    department: "Water Board", location: "House 12, Road 7, Sector 7, Uttara, Dhaka",
    created_at: "2026-05-13T06:15:00Z", updated_at: "2026-05-14T09:00:00Z", resolved_at: null, due_date: "2026-05-14T06:15:00Z",
  },
  {
    id: "t3", ticket_number: "CVD-2026-0003", citizen_id: "u7", citizen_name: "Mizanur Rahman",
    category: "Waste Management", title: "Garbage not collected from Mohammadpur for 2 weeks",
    description: "The municipal garbage collection truck has not visited our area in Mohammadpur, Block C for over two weeks. Waste is piling up on the streets causing a terrible smell and health hazards. Stray animals are scattering the garbage everywhere.",
    status: "resolved", priority: "medium", assigned_to: "u3", assigned_agent_name: "Rafiq Uddin",
    department: "Sanitation", location: "Block C, Mohammadpur, Dhaka",
    created_at: "2026-05-01T10:00:00Z", updated_at: "2026-05-08T16:45:00Z", resolved_at: "2026-05-08T16:45:00Z", due_date: "2026-05-04T10:00:00Z",
  },
  {
    id: "t4", ticket_number: "CVD-2026-0004", citizen_id: "u1", citizen_name: "Arif Hossain",
    category: "Electricity", title: "Street lights not working on Gulshan Avenue",
    description: "Almost all street lights on Gulshan Avenue between Circle 1 and Circle 2 are not functioning. This stretch is very dark at night making it unsafe for pedestrians and commuters. Several residents have reported theft incidents in the area.",
    status: "submitted", priority: "high", assigned_to: null, assigned_agent_name: null,
    department: "Power Division", location: "Gulshan Avenue, Circle 1-2, Dhaka",
    created_at: "2026-05-16T18:00:00Z", updated_at: "2026-05-16T18:00:00Z", resolved_at: null, due_date: "2026-05-17T18:00:00Z",
  },
  {
    id: "t5", ticket_number: "CVD-2026-0005", citizen_id: "u2", citizen_name: "Fatima Akter",
    category: "Public Safety", title: "Broken traffic signal at Farmgate intersection",
    description: "The traffic signal at the main Farmgate intersection has been malfunctioning since yesterday morning. It is stuck on green in all directions simultaneously, causing extreme confusion and near-miss accidents. Traffic police are not always present to manage the flow.",
    status: "in_progress", priority: "critical", assigned_to: "u8", assigned_agent_name: "Tahmina Khatun",
    department: "Law Enforcement", location: "Farmgate Intersection, Dhaka",
    created_at: "2026-05-15T07:45:00Z", updated_at: "2026-05-16T11:30:00Z", resolved_at: null, due_date: "2026-05-15T19:45:00Z",
  },
  {
    id: "t6", ticket_number: "CVD-2026-0006", citizen_id: "u7", citizen_name: "Mizanur Rahman",
    category: "Parks & Recreation", title: "Playground equipment broken at Ramna Park",
    description: "Several pieces of playground equipment at Ramna Park's children section are broken and rusting. The main swing set has a broken chain, the slide has a crack, and the seesaw is completely detached. Children are at risk of injury.",
    status: "pending_citizen", priority: "low", assigned_to: "u4", assigned_agent_name: "Nasreen Begum",
    department: "Urban Dev", location: "Ramna Park, Children's Section, Dhaka",
    created_at: "2026-05-05T14:30:00Z", updated_at: "2026-05-12T10:00:00Z", resolved_at: null, due_date: "2026-05-10T14:30:00Z",
  },
  {
    id: "t7", ticket_number: "CVD-2026-0007", citizen_id: "u1", citizen_name: "Arif Hossain",
    category: "Noise Complaint", title: "Construction noise at midnight in Banani",
    description: "A construction site at House 45, Road 11, Banani is operating heavy machinery well past midnight every night. The noise is unbearable and disturbing the sleep of hundreds of residents. This has been going on for the past 10 days despite verbal complaints to the site manager.",
    status: "closed", priority: "low", assigned_to: "u3", assigned_agent_name: "Rafiq Uddin",
    department: "Environment", location: "House 45, Road 11, Banani, Dhaka",
    created_at: "2026-04-20T22:00:00Z", updated_at: "2026-04-28T09:00:00Z", resolved_at: "2026-04-27T15:00:00Z", due_date: "2026-04-24T22:00:00Z",
  },
  {
    id: "t8", ticket_number: "CVD-2026-0008", citizen_id: "u2", citizen_name: "Fatima Akter",
    category: "Water Supply", title: "Contaminated water from taps in Bashundhara",
    description: "For the past three days, the tap water in our area of Bashundhara R/A Block D has been yellowish-brown in color and has a foul smell. It is clearly not safe for consumption. We are worried about the health impact on families who may have used it unknowingly.",
    status: "in_progress", priority: "high", assigned_to: "u4", assigned_agent_name: "Nasreen Begum",
    department: "Water Board", location: "Block D, Bashundhara R/A, Dhaka",
    created_at: "2026-05-14T09:30:00Z", updated_at: "2026-05-16T08:00:00Z", resolved_at: null, due_date: "2026-05-15T09:30:00Z",
  },
];

// --- Ticket messages for t1 ---
export const mockMessages: TicketMessage[] = [
  {
    id: "m1", ticket_id: "t1", sender_id: "u1", sender_name: "Arif Hossain", sender_role: "citizen",
    body: "This pothole has been causing accidents daily. Please prioritize this urgently. I have attached photos of the damage to vehicles.",
    is_internal: false, created_at: "2026-05-10T08:30:00Z",
  },
  {
    id: "m2", ticket_id: "t1", sender_id: "u3", sender_name: "Rafiq Uddin", sender_role: "agent",
    body: "Thank you for reporting this issue, Mr. Hossain. We have escalated this to our road maintenance team. An inspection team will visit the site within 24 hours.",
    is_internal: false, created_at: "2026-05-10T10:15:00Z",
  },
  {
    id: "m3", ticket_id: "t1", sender_id: "u3", sender_name: "Rafiq Uddin", sender_role: "agent",
    body: "Internal note: Contacted DCC Zone 3 office. They confirmed this is a known issue — budget approval pending for road repairs in Mirpur sector.",
    is_internal: true, created_at: "2026-05-10T10:30:00Z",
  },
  {
    id: "m4", ticket_id: "t1", sender_id: "u5", sender_name: "Kamal Ahmed", sender_role: "supervisor",
    body: "Prioritizing this due to safety risk. Rafiq, please coordinate with the contractor for emergency patch repair within 48 hours.",
    is_internal: true, created_at: "2026-05-11T09:00:00Z",
  },
  {
    id: "m5", ticket_id: "t1", sender_id: "u3", sender_name: "Rafiq Uddin", sender_role: "agent",
    body: "Update: Our road maintenance contractor has been dispatched and will begin emergency patching work tomorrow morning. We apologize for the delay and appreciate your patience.",
    is_internal: false, created_at: "2026-05-15T14:20:00Z",
  },
];

// --- Audit log ---
export const mockAuditLog: AuditLogEntry[] = [
  { id: "a1", ticket_id: "t1", ticket_number: "CVD-2026-0001", actor_id: "u6", actor_name: "System", action: "Ticket created", old_value: null, new_value: "submitted", created_at: "2026-05-10T08:30:00Z" },
  { id: "a2", ticket_id: "t1", ticket_number: "CVD-2026-0001", actor_id: "u5", actor_name: "Kamal Ahmed", action: "Assigned agent", old_value: null, new_value: "Rafiq Uddin", created_at: "2026-05-10T09:00:00Z" },
  { id: "a3", ticket_id: "t1", ticket_number: "CVD-2026-0001", actor_id: "u3", actor_name: "Rafiq Uddin", action: "Status changed", old_value: "submitted", new_value: "under_review", created_at: "2026-05-10T10:15:00Z" },
  { id: "a4", ticket_id: "t1", ticket_number: "CVD-2026-0001", actor_id: "u5", actor_name: "Kamal Ahmed", action: "Priority changed", old_value: "high", new_value: "critical", created_at: "2026-05-11T09:00:00Z" },
  { id: "a5", ticket_id: "t1", ticket_number: "CVD-2026-0001", actor_id: "u3", actor_name: "Rafiq Uddin", action: "Status changed", old_value: "under_review", new_value: "in_progress", created_at: "2026-05-15T14:20:00Z" },
  { id: "a6", ticket_id: "t2", ticket_number: "CVD-2026-0002", actor_id: "u6", actor_name: "System", action: "Ticket created", old_value: null, new_value: "submitted", created_at: "2026-05-13T06:15:00Z" },
  { id: "a7", ticket_id: "t2", ticket_number: "CVD-2026-0002", actor_id: "u5", actor_name: "Kamal Ahmed", action: "Assigned agent", old_value: null, new_value: "Nasreen Begum", created_at: "2026-05-13T07:00:00Z" },
  { id: "a8", ticket_id: "t2", ticket_number: "CVD-2026-0002", actor_id: "u4", actor_name: "Nasreen Begum", action: "Status changed", old_value: "submitted", new_value: "under_review", created_at: "2026-05-14T09:00:00Z" },
  { id: "a9", ticket_id: "t3", ticket_number: "CVD-2026-0003", actor_id: "u6", actor_name: "System", action: "Ticket created", old_value: null, new_value: "submitted", created_at: "2026-05-01T10:00:00Z" },
  { id: "a10", ticket_id: "t3", ticket_number: "CVD-2026-0003", actor_id: "u3", actor_name: "Rafiq Uddin", action: "Status changed", old_value: "in_progress", new_value: "resolved", created_at: "2026-05-08T16:45:00Z" },
  { id: "a11", ticket_id: "t4", ticket_number: "CVD-2026-0004", actor_id: "u6", actor_name: "System", action: "Ticket created", old_value: null, new_value: "submitted", created_at: "2026-05-16T18:00:00Z" },
  { id: "a12", ticket_id: "t5", ticket_number: "CVD-2026-0005", actor_id: "u6", actor_name: "System", action: "Ticket created", old_value: null, new_value: "submitted", created_at: "2026-05-15T07:45:00Z" },
  { id: "a13", ticket_id: "t5", ticket_number: "CVD-2026-0005", actor_id: "u8", actor_name: "Tahmina Khatun", action: "Status changed", old_value: "under_review", new_value: "in_progress", created_at: "2026-05-16T11:30:00Z" },
  { id: "a14", ticket_id: "t7", ticket_number: "CVD-2026-0007", actor_id: "u3", actor_name: "Rafiq Uddin", action: "Status changed", old_value: "resolved", new_value: "closed", created_at: "2026-04-28T09:00:00Z" },
];

// --- Timeline for t1 ---
export const mockTimeline: TimelineEvent[] = [
  { id: "tl1", status: "submitted", description: "Complaint submitted by citizen", actor: "Arif Hossain", created_at: "2026-05-10T08:30:00Z" },
  { id: "tl2", status: "under_review", description: "Ticket assigned to Rafiq Uddin and moved to review", actor: "Kamal Ahmed", created_at: "2026-05-10T09:00:00Z" },
  { id: "tl3", status: "under_review", description: "Priority escalated from high to critical", actor: "Kamal Ahmed", created_at: "2026-05-11T09:00:00Z" },
  { id: "tl4", status: "in_progress", description: "Contractor dispatched for emergency repair", actor: "Rafiq Uddin", created_at: "2026-05-15T14:20:00Z" },
];

// --- Stats ---
export const mockStats = {
  totalTickets: 847,
  openTickets: 124,
  inProgress: 89,
  resolved: 598,
  overdue: 36,
  avgResolutionHours: 52,
  slaCompliance: 87,
  citizenSatisfaction: 4.2,
};

export const mockAgentStats = [
  { id: "u3", name: "Rafiq Uddin", email: "rafiq.uddin@civicdesk.gov", role: "agent" as UserRole, open: 18, inProgress: 12, resolved: 145, avgHours: 38 },
  { id: "u4", name: "Nasreen Begum", email: "nasreen.begum@civicdesk.gov", role: "agent" as UserRole, open: 14, inProgress: 9, resolved: 132, avgHours: 44 },
  { id: "u8", name: "Tahmina Khatun", email: "tahmina.k@civicdesk.gov", role: "agent" as UserRole, open: 21, inProgress: 15, resolved: 98, avgHours: 51 },
];

// --- Helpers ---
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
    year: "numeric", month: "short", day: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
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

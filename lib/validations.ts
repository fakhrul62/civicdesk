import { z } from "zod";

// ─────────────────────────────────────────────
// AUTH SCHEMAS
// ─────────────────────────────────────────────

export const signUpSchema = z.object({
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be under 100 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  phone: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

// ─────────────────────────────────────────────
// TICKET SCHEMAS
// ─────────────────────────────────────────────

export const createTicketSchema = z.object({
  title: z
    .string()
    .min(10, "Title must be at least 10 characters")
    .max(200, "Title must be under 200 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(5000, "Description must be under 5000 characters"),
  category_id: z.string().min(1, "Please select a category"),
  location: z.string().min(5, "Location must be at least 5 characters").optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  priority: z.enum(["critical", "high", "medium", "low"]).optional(),
});

export const updateTicketStatusSchema = z.object({
  ticket_id: z.string().min(1),
  status: z.enum([
    "submitted",
    "under_review",
    "in_progress",
    "pending_citizen",
    "resolved",
    "closed",
  ]),
  message: z.string().optional(), // Optional note on why status changed
});

export const updateTicketPrioritySchema = z.object({
  ticket_id: z.string().min(1),
  priority: z.enum(["critical", "high", "medium", "low"]),
});

export const assignAgentSchema = z.object({
  ticket_id: z.string().min(1),
  agent_id: z.string().min(1, "Please select an agent"),
});

// ─────────────────────────────────────────────
// MESSAGE SCHEMAS
// ─────────────────────────────────────────────

export const sendMessageSchema = z.object({
  ticket_id: z.string().min(1),
  body: z
    .string()
    .min(1, "Message cannot be empty")
    .max(5000, "Message must be under 5000 characters"),
  is_internal: z.boolean().default(false),
});

// ─────────────────────────────────────────────
// CATEGORY SCHEMAS
// ─────────────────────────────────────────────

export const createCategorySchema = z.object({
  name: z
    .string()
    .min(3, "Category name must be at least 3 characters")
    .max(100),
  department: z.string().min(3, "Department name required"),
  description: z.string().optional(),
  default_priority: z.enum(["critical", "high", "medium", "low"]).default("medium"),
  sla_hours: z.number().int().min(1).max(720).default(72),
});

// ─────────────────────────────────────────────
// SETTINGS SCHEMAS
// ─────────────────────────────────────────────

export const updateSlaSchema = z.object({
  critical_hours: z.number().int().min(1).max(168),
  high_hours: z.number().int().min(1).max(336),
  medium_hours: z.number().int().min(1).max(504),
  low_hours: z.number().int().min(1).max(720),
  escalation_minutes: z.number().int().min(5).max(240),
  warning_minutes: z.number().int().min(5).max(480),
});

// ─────────────────────────────────────────────
// TYPE EXPORTS
// ─────────────────────────────────────────────

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type CreateTicketInput = z.infer<typeof createTicketSchema>;
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
export type UpdateTicketPriorityInput = z.infer<typeof updateTicketPrioritySchema>;
export type AssignAgentInput = z.infer<typeof assignAgentSchema>;
export type SendMessageInput = z.infer<typeof sendMessageSchema>;
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateSlaInput = z.infer<typeof updateSlaSchema>;

import { prisma } from "@/lib/prisma";

/**
 * Generate a unique ticket number in format: CVD-YYYY-XXXX
 * Example: CVD-2026-0142
 */
export async function generateTicketNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `CVD-${year}-`;

  // Get the latest ticket number for this year
  const latest = await prisma.ticket.findFirst({
    where: {
      ticket_number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      created_at: "desc",
    },
    select: {
      ticket_number: true,
    },
  });

  let nextNumber = 1;

  if (latest) {
    const lastNum = parseInt(latest.ticket_number.replace(prefix, ""), 10);
    if (!isNaN(lastNum)) {
      nextNumber = lastNum + 1;
    }
  }

  return `${prefix}${nextNumber.toString().padStart(4, "0")}`;
}

/**
 * Calculate due date based on SLA hours from category
 */
export function calculateDueDate(slaHours: number): Date {
  const now = new Date();
  return new Date(now.getTime() + slaHours * 60 * 60 * 1000);
}

/**
 * Check if a ticket is overdue
 */
export function isTicketOverdue(
  dueDate: Date | null,
  status: string
): boolean {
  if (!dueDate) return false;
  if (status === "resolved" || status === "closed") return false;
  return new Date() > dueDate;
}

/**
 * Format a date for display
 */
export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function timeAgo(date: Date | string): string {
  const seconds = Math.floor(
    (new Date().getTime() - new Date(date).getTime()) / 1000
  );

  const intervals = [
    { label: "y", seconds: 31536000 },
    { label: "mo", seconds: 2592000 },
    { label: "d", seconds: 86400 },
    { label: "h", seconds: 3600 },
    { label: "m", seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(seconds / interval.seconds);
    if (count >= 1) return `${count}${interval.label} ago`;
  }

  return "just now";
}

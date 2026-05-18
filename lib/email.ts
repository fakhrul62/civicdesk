import { Resend } from "resend";

let resend: Resend | null = null;

function getResend() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM = process.env.RESEND_FROM_EMAIL || "CivicDesk <noreply@civicdesk.gov>";

// ─────────────────────────────────────────────
// EMAIL TEMPLATES
// ─────────────────────────────────────────────

interface TicketEmailData {
  ticketNumber: string;
  citizenName: string;
  citizenEmail: string;
  title: string;
  category: string;
  status?: string;
  agentName?: string;
  message?: string;
}

/**
 * Send ticket confirmation email after submission
 */
export async function sendTicketConfirmation(data: TicketEmailData) {
  const r = getResend();

  return r.emails.send({
    from: FROM,
    to: [data.citizenEmail],
    subject: `Your complaint has been registered — ${data.ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
          .header { background: #7c9e7a; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; }
          .body { background: #f8faf8; padding: 24px; border: 1px solid #e2e8e0; border-top: none; border-radius: 0 0 8px 8px; }
          .ticket-number { font-family: monospace; background: #7c9e7a20; padding: 12px; border-radius: 6px; text-align: center; font-size: 18px; font-weight: bold; color: #7c9e7a; margin: 16px 0; }
          .detail { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e2e8e0; font-size: 14px; }
          .detail:last-child { border-bottom: none; }
          .label { color: #666; }
          .cta { display: inline-block; background: #7c9e7a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏛 CivicDesk</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Complaint Registered Successfully</p>
        </div>
        <div class="body">
          <p>Dear ${data.citizenName},</p>
          <p>Your complaint has been successfully registered and assigned a tracking number:</p>
          <div class="ticket-number">${data.ticketNumber}</div>
          <div class="detail"><span class="label">Title</span><strong>${data.title}</strong></div>
          <div class="detail"><span class="label">Category</span><span>${data.category}</span></div>
          <div class="detail"><span class="label">Status</span><span>Submitted</span></div>
          <p style="font-size: 14px; color: #666;">You can track your complaint status at any time using your ticket number.</p>
          <center><a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track?id=${data.ticketNumber}" class="cta">Track Your Complaint</a></center>
        </div>
        <div class="footer">
          <p>CivicDesk Municipal Portal — Your voice matters.</p>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send status update email when ticket status changes
 */
export async function sendStatusUpdate(data: TicketEmailData) {
  const r = getResend();

  const statusLabels: Record<string, string> = {
    submitted: "Submitted",
    under_review: "Under Review",
    in_progress: "In Progress",
    pending_citizen: "Pending Your Response",
    resolved: "Resolved",
    closed: "Closed",
  };

  const statusLabel = statusLabels[data.status || ""] || data.status || "Updated";

  return r.emails.send({
    from: FROM,
    to: [data.citizenEmail],
    subject: `Status update: ${data.ticketNumber} — ${statusLabel}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
          .header { background: #7c9e7a; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; }
          .body { background: #f8faf8; padding: 24px; border: 1px solid #e2e8e0; border-top: none; border-radius: 0 0 8px 8px; }
          .status-badge { display: inline-block; background: #7c9e7a; color: white; padding: 6px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; }
          .cta { display: inline-block; background: #7c9e7a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏛 CivicDesk</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Complaint Status Update</p>
        </div>
        <div class="body">
          <p>Dear ${data.citizenName},</p>
          <p>The status of your complaint <strong>${data.ticketNumber}</strong> has been updated:</p>
          <p style="text-align: center; margin: 20px 0;"><span class="status-badge">${statusLabel}</span></p>
          ${data.message ? `<p style="background: #f0f0f0; padding: 12px; border-radius: 6px; font-size: 14px;">${data.message}</p>` : ""}
          ${data.agentName ? `<p style="font-size: 14px; color: #666;">Agent: ${data.agentName}</p>` : ""}
          <center><a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track?id=${data.ticketNumber}" class="cta">View Details</a></center>
        </div>
        <div class="footer">
          <p>CivicDesk Municipal Portal — Your voice matters.</p>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send agent assignment notification
 */
export async function sendAgentAssigned(data: TicketEmailData) {
  const r = getResend();

  return r.emails.send({
    from: FROM,
    to: [data.citizenEmail],
    subject: `Agent assigned to ${data.ticketNumber}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
          .header { background: #7c9e7a; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; }
          .body { background: #f8faf8; padding: 24px; border: 1px solid #e2e8e0; border-top: none; border-radius: 0 0 8px 8px; }
          .cta { display: inline-block; background: #7c9e7a; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>🏛 CivicDesk</h1>
          <p style="margin: 4px 0 0; opacity: 0.9; font-size: 14px;">Agent Assigned</p>
        </div>
        <div class="body">
          <p>Dear ${data.citizenName},</p>
          <p>An agent has been assigned to handle your complaint <strong>${data.ticketNumber}</strong>.</p>
          ${data.agentName ? `<p><strong>Assigned Agent:</strong> ${data.agentName}</p>` : ""}
          <p style="font-size: 14px; color: #666;">The agent will review your complaint and get back to you soon.</p>
          <center><a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track?id=${data.ticketNumber}" class="cta">Track Your Complaint</a></center>
        </div>
        <div class="footer">
          <p>CivicDesk Municipal Portal — Your voice matters.</p>
        </div>
      </body>
      </html>
    `,
  });
}

/**
 * Send resolution notification
 */
export async function sendResolutionNotice(data: TicketEmailData) {
  const r = getResend();

  return r.emails.send({
    from: FROM,
    to: [data.citizenEmail],
    subject: `Resolved: ${data.ticketNumber} — ${data.title}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: 'Segoe UI', Tahoma, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #1a1a1a; }
          .header { background: #2d8a6e; color: white; padding: 24px; border-radius: 8px 8px 0 0; text-align: center; }
          .header h1 { margin: 0; font-size: 20px; }
          .body { background: #f0faf5; padding: 24px; border: 1px solid #c6e8d8; border-top: none; border-radius: 0 0 8px 8px; }
          .resolved { text-align: center; margin: 20px 0; font-size: 16px; font-weight: 600; color: #2d8a6e; }
          .cta { display: inline-block; background: #2d8a6e; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600; margin-top: 16px; }
          .footer { text-align: center; color: #999; font-size: 12px; margin-top: 24px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>✅ Complaint Resolved</h1>
        </div>
        <div class="body">
          <p>Dear ${data.citizenName},</p>
          <p>We're pleased to inform you that your complaint has been resolved:</p>
          <p class="resolved">${data.ticketNumber} — ${data.title}</p>
          ${data.message ? `<p style="background: #e0f5ec; padding: 12px; border-radius: 6px; font-size: 14px;">${data.message}</p>` : ""}
          <p style="font-size: 14px; color: #666;">If you believe this issue has not been fully resolved, please reply through the portal.</p>
          <center><a href="${process.env.NEXTAUTH_URL || "http://localhost:3000"}/track?id=${data.ticketNumber}" class="cta">View Resolution</a></center>
        </div>
        <div class="footer">
          <p>Thank you for helping improve our community. — CivicDesk</p>
        </div>
      </body>
      </html>
    `,
  });
}

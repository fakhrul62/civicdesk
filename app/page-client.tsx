"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Search,
  Clock,
  CheckCircle2,
  ArrowRight,
  Shield,
  Users,
  Landmark,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const steps = [
  {
    step: "01",
    title: "Submit Your Complaint",
    description: "Fill out a simple form describing your civic issue. Attach photos, select a category, and provide the location.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Receive a Ticket ID",
    description: "Get an instant unique ticket number to track your complaint status at any time without needing to log in.",
    icon: Shield,
  },
  {
    step: "03",
    title: "We Investigate & Act",
    description: "Your complaint is routed to the right department. Agents review, prioritize, and work to resolve the issue.",
    icon: Zap,
  },
  {
    step: "04",
    title: "Stay Updated",
    description: "Receive status updates via email and track progress through our portal until your issue is fully resolved.",
    icon: MessageSquare,
  },
];

type HomeClientProps = {
  stats: {
    totalTickets: number;
    resolvedTickets: number;
    activeCitizens: number;
    avgResolutionHours: number;
  };
  categories: Array<{
    name: string;
    count: number;
  }>;
};

const categoryColors = [
  "bg-primary/10 text-primary",
  "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  "bg-red-500/10 text-red-600 dark:text-red-400",
  "bg-violet-500/10 text-violet-600 dark:text-violet-400",
];

export function HomeClient({ stats, categories }: HomeClientProps) {
  const router = useRouter();
  const [ticketId, setTicketId] = useState("");
  const [tracking, setTracking] = useState(false);
  const homepageStats = [
    { label: "Complaints Submitted", value: stats.totalTickets.toLocaleString(), icon: FileText },
    { label: "Complaints Resolved", value: stats.resolvedTickets.toLocaleString(), icon: CheckCircle2 },
    { label: "Active Citizens", value: stats.activeCitizens.toLocaleString(), icon: Users },
    { label: "Avg. Resolution Time", value: `${stats.avgResolutionHours} hrs`, icon: Clock },
  ];

  const handleTrack = () => {
    if (ticketId.trim()) {
      setTracking(true);
      router.push(`/track?id=${encodeURIComponent(ticketId.trim())}`);
    }
  };

  return (
    <main className="flex-1">
      {/* ==================== HERO ==================== */}
      <section className="relative overflow-hidden border-b bg-muted/30">
        {/* Subtle grid pattern */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24 lg:py-32">
          <div className="mx-auto max-w-2xl text-center">
            <Badge
              variant="secondary"
              className="mb-4 gap-1.5 border px-3 py-1 text-xs font-medium"
            >
              <Landmark className="h-3 w-3" />
              Government Complaint Portal
            </Badge>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Your voice matters.{" "}
              <span className="text-primary">We listen.</span>
            </h1>

            <p className="mx-auto mt-4 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg">
              Report civic issues, track their progress in real time, and hold
              your government accountable — all in one transparent platform.
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full gap-2 sm:w-auto">
                <Link href="/submit">
                  <FileText className="h-4 w-4" />
                  Submit a Complaint
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full gap-2 sm:w-auto">
                <Link href="/dashboard">
                  <Users className="h-4 w-4" />
                  Citizen Dashboard
                </Link>
              </Button>
            </div>

            {/* Track Complaint Inline */}
            <div className="mx-auto mt-8 max-w-md">
              <div className="flex items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm">
                <div className="flex flex-1 items-center gap-2 px-2">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Enter your ticket ID"
                    value={ticketId}
                    onChange={(e) => setTicketId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleTrack()}
                    className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
                  />
                </div>
                <Button size="sm" onClick={handleTrack} className="shrink-0" disabled={tracking}>
                  {tracking ? (
                    <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    "Track"
                  )}
                </Button>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Already submitted? Enter your ticket ID to check status instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==================== STATS BAR ==================== */}
      <section className="border-b">
        <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y sm:divide-y-0 lg:grid-cols-4">
          {homepageStats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 px-4 py-6 sm:px-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xl font-bold tracking-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ==================== HOW IT WORKS ==================== */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-lg text-center">
            <Badge variant="secondary" className="mb-3 text-xs">
              Simple Process
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              How it works
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              From submission to resolution — a transparent process you can trust.
            </p>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((item, i) => (
              <Card
                key={item.step}
                className="group relative border bg-card transition-colors hover:border-primary/30 hover:bg-accent/50"
              >
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                      <item.icon className="h-5 w-5 text-primary" />
                    </div>
                    <span className="text-3xl font-bold text-muted-foreground/20">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-semibold">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </CardContent>
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="absolute -right-3 top-1/2 hidden h-px w-6 bg-border lg:block" />
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CATEGORIES ==================== */}
      <section className="border-t bg-muted/30 py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-lg text-center">
            <Badge variant="secondary" className="mb-3 text-xs">
              Departments
            </Badge>
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              What you can report
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We handle complaints across all major civic service categories.
            </p>
          </div>

          <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {categories.map((cat, index) => (
              <Card
                key={cat.name}
                className="group cursor-pointer border transition-colors hover:border-primary/30"
              >
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                        categoryColors[index % categoryColors.length]
                      }`}
                    >
                      <FileText className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{cat.name}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs font-normal">
                    {cat.count.toLocaleString()} complaints
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ==================== CTA BANNER ==================== */}
      <section className="border-t py-16 sm:py-24">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <Card className="border bg-primary/5">
            <CardContent className="flex flex-col items-center gap-4 p-8 text-center sm:p-12">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Landmark className="h-6 w-6 text-primary" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight">
                Ready to make a difference?
              </h2>
              <p className="max-w-md text-sm text-muted-foreground">
                Your complaint helps improve civic services for everyone. Start by
                submitting your issue — we&apos;ll take it from there.
              </p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/submit">
                    <FileText className="h-4 w-4" />
                    Submit a Complaint
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                  <Link href="/track">
                    <Search className="h-4 w-4" />
                    Track Existing Complaint
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}

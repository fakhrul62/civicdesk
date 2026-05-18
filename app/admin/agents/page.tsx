"use client";

import { useState } from "react";
import {
  Users,
  Plus,
  Search,
  Clock,
  CheckCircle2,
  MoreHorizontal,
  Trash2,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { mockAgentStats } from "@/lib/mock-data";

export default function AdminAgentsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const agents = mockAgentStats.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResolved = agents.reduce((sum, a) => sum + a.resolved, 0);
  const avgResolutionTime = Math.round(
    agents.reduce((sum, a) => sum + a.avgHours, 0) / agents.length
  );

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Agents</h1>
          <p className="text-sm text-muted-foreground">
            Manage support agents and monitor their workload.
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Agent</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-1.5">
                <Label className="text-sm">Full Name</Label>
                <Input placeholder="Enter agent's full name" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Email Address</Label>
                <Input placeholder="agent@civicdesk.gov" type="email" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm">Department</Label>
                <Input placeholder="e.g. Public Works" />
              </div>
              <Button className="w-full" onClick={() => setDialogOpen(false)}>
                Add Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary */}
      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{agents.length}</p>
              <p className="text-xs text-muted-foreground">Active Agents</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-status-resolved/10">
              <CheckCircle2 className="h-4 w-4 text-status-resolved" />
            </div>
            <div>
              <p className="text-xl font-bold">{totalResolved}</p>
              <p className="text-xs text-muted-foreground">Total Resolved</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-status-under-review/10">
              <Clock className="h-4 w-4 text-status-under-review" />
            </div>
            <div>
              <p className="text-xl font-bold">{avgResolutionTime}h</p>
              <p className="text-xs text-muted-foreground">Avg. Resolution</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search agents..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>

      {/* Agent cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const totalLoad = agent.open + agent.inProgress;
          const capacity = 40;
          const loadPercent = Math.min((totalLoad / capacity) * 100, 100);

          return (
            <Card key={agent.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="text-sm bg-primary/10 text-primary">
                        {agent.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-sm font-semibold">{agent.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {agent.email}
                      </p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-3.5 w-3.5" />
                        Edit Agent
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive">
                        <Trash2 className="mr-2 h-3.5 w-3.5" />
                        Remove Agent
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Stats */}
                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border p-2">
                    <p className="text-lg font-bold">{agent.open}</p>
                    <p className="text-[10px] text-muted-foreground">Open</p>
                  </div>
                  <div className="rounded-md border p-2">
                    <p className="text-lg font-bold">{agent.inProgress}</p>
                    <p className="text-[10px] text-muted-foreground">Active</p>
                  </div>
                  <div className="rounded-md border p-2">
                    <p className="text-lg font-bold">{agent.resolved}</p>
                    <p className="text-[10px] text-muted-foreground">Resolved</p>
                  </div>
                </div>

                {/* Load bar */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Workload</span>
                    <span className="font-medium">
                      {totalLoad}/{capacity}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full transition-all ${
                        loadPercent > 80
                          ? "bg-priority-critical"
                          : loadPercent > 50
                          ? "bg-priority-high"
                          : "bg-primary"
                      }`}
                      style={{ width: `${loadPercent}%` }}
                    />
                  </div>
                </div>

                {/* Avg resolution */}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  Avg. resolution: {agent.avgHours}h
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, Search, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateUserRole } from "@/actions/admin";

type AgentStat = {
  id: string;
  name: string;
  email: string;
  role: string;
  open: number;
  inProgress: number;
  resolved: number;
  avgHours: number;
};

type AdminUser = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  role: "citizen" | "agent" | "supervisor" | "admin";
  is_active: boolean;
  assigned_tickets: { status: string }[];
  submitted_tickets: { status: string }[];
};

export function AdminAgentsClient({
  agentStats,
  users,
  currentUser,
}: {
  agentStats: AgentStat[];
  users: AdminUser[];
  currentUser: { role: string };
}) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [savingUserId, setSavingUserId] = useState("");

  const agents = agentStats.filter((agent) =>
    `${agent.name} ${agent.email}`.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredUsers = users.filter((user) =>
    `${user.full_name} ${user.email} ${user.role}`.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResolved = agents.reduce((sum, agent) => sum + agent.resolved, 0);
  const avgResolutionTime = agents.length
    ? Math.round(agents.reduce((sum, agent) => sum + agent.avgHours, 0) / agents.length)
    : 0;
  const canManageUsers = currentUser.role === "admin";

  const handleRoleChange = async (user: AdminUser, role: AdminUser["role"]) => {
    setSavingUserId(user.id);
    await updateUserRole({ userId: user.id, role, is_active: user.is_active });
    setSavingUserId("");
    router.refresh();
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users & Staff</h1>
          <p className="text-sm text-muted-foreground">
            Super admins can promote users, assign staff roles, and monitor workload.
          </p>
        </div>
        {canManageUsers && (
          <Badge variant="outline" className="w-fit gap-2">
            <ShieldCheck className="h-3.5 w-3.5" />
            Super Admin Access
          </Badge>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Card className="border">
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold">{agents.length}</p>
              <p className="text-xs text-muted-foreground">Active Staff</p>
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

      <div className="relative max-w-sm">
        <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search users..."
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          className="h-9 pl-8 text-sm"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => {
          const totalLoad = agent.open + agent.inProgress;
          const capacity = 40;
          const loadPercent = Math.min((totalLoad / capacity) * 100, 100);

          return (
            <Card key={agent.id} className="border">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-sm text-primary">
                      {agent.name.split(" ").map((name) => name[0]).join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-semibold">{agent.name}</h3>
                    <p className="truncate text-xs text-muted-foreground">{agent.email}</p>
                    <Badge variant="secondary" className="mt-1 text-[10px] capitalize">{agent.role}</Badge>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border p-2"><p className="text-lg font-bold">{agent.open}</p><p className="text-[10px] text-muted-foreground">Open</p></div>
                  <div className="rounded-md border p-2"><p className="text-lg font-bold">{agent.inProgress}</p><p className="text-[10px] text-muted-foreground">Active</p></div>
                  <div className="rounded-md border p-2"><p className="text-lg font-bold">{agent.resolved}</p><p className="text-[10px] text-muted-foreground">Resolved</p></div>
                </div>

                <div className="mt-3 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Workload</span>
                    <span className="font-medium">{totalLoad}/{capacity}</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted">
                    <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${loadPercent}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {canManageUsers && (
        <Card className="border">
          <CardContent className="p-0">
            <div className="border-b p-4">
              <h2 className="font-semibold">All Users</h2>
              <p className="text-sm text-muted-foreground">Change a citizen into an agent, supervisor, or admin.</p>
            </div>
            <div className="divide-y">
              {filteredUsers.map((user) => (
                <div key={user.id} className="grid gap-3 p-4 sm:grid-cols-[1fr_180px_100px] sm:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{user.full_name}</p>
                    <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Submitted {user.submitted_tickets.length} · Assigned {user.assigned_tickets.length}
                    </p>
                  </div>
                  <Select value={user.role} onValueChange={(role) => handleRoleChange(user, role as AdminUser["role"])}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="citizen">Citizen</SelectItem>
                      <SelectItem value="agent">Agent</SelectItem>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Super Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button variant="outline" size="sm" disabled>
                    {savingUserId === user.id ? "Saving..." : user.is_active ? "Active" : "Inactive"}
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

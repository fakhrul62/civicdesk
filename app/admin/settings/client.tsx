"use client";

import { useState } from "react";
import {
  Save,
  Plus,
  Trash2,
  Mail,
  Clock,
  Tag,
  Palette,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPriorityLabel } from "@/lib/mock-data";

const emailTemplates = [
  { id: "e1", name: "Ticket Confirmation", subject: "Your complaint has been registered — {{ticket_number}}", trigger: "On submission" },
  { id: "e2", name: "Status Update", subject: "Status update for {{ticket_number}}", trigger: "On status change" },
  { id: "e3", name: "Agent Assigned", subject: "An agent has been assigned to {{ticket_number}}", trigger: "On assignment" },
  { id: "e4", name: "Resolution Notice", subject: "Your complaint {{ticket_number}} has been resolved", trigger: "On resolve" },
  { id: "e5", name: "SLA Breach Warning", subject: "SLA warning: {{ticket_number}} approaching deadline", trigger: "Before SLA breach" },
];

export function AdminSettingsClient({ categories }: { categories: any[] }) {
  const [orgName, setOrgName] = useState("CivicDesk Municipal Portal");
  const [orgEmail, setOrgEmail] = useState("support@civicdesk.gov");
  const [orgPhone, setOrgPhone] = useState("1-800-CIVIC-01");

  return (
    <div className="p-4 sm:p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Configure departments, SLA rules, email templates, and system preferences.
        </p>
      </div>

      <Tabs defaultValue="categories">
        <TabsList className="flex-wrap">
          <TabsTrigger value="categories" className="gap-1.5">
            <Tag className="h-3.5 w-3.5" />
            Categories
          </TabsTrigger>
          <TabsTrigger value="sla" className="gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            SLA Rules
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" />
            Email Templates
          </TabsTrigger>
          <TabsTrigger value="branding" className="gap-1.5">
            <Palette className="h-3.5 w-3.5" />
            Branding
          </TabsTrigger>
        </TabsList>

        {/* Categories */}
        <TabsContent value="categories" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Department Categories</h3>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Category
            </Button>
          </div>
          <Card className="border">
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Category</TableHead>
                    <TableHead className="text-xs">Department</TableHead>
                    <TableHead className="text-xs">Default Priority</TableHead>
                    <TableHead className="text-xs">SLA Hours</TableHead>
                    <TableHead className="text-xs w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat) => (
                    <TableRow key={cat.id}>
                      <TableCell className="font-medium text-sm">{cat.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{cat.department || "General"}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">
                          {getPriorityLabel(cat.default_priority)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{cat.sla_hours}h</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive">
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SLA */}
        <TabsContent value="sla" className="mt-6 space-y-4">
          <h3 className="font-semibold">SLA Configuration</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Default SLA Timers</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Critical Priority (hours)</Label>
                  <Input type="number" defaultValue={12} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">High Priority (hours)</Label>
                  <Input type="number" defaultValue={24} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Medium Priority (hours)</Label>
                  <Input type="number" defaultValue={72} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Low Priority (hours)</Label>
                  <Input type="number" defaultValue={120} className="h-9" />
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Escalation Rules</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Auto-escalate after breach (minutes)</Label>
                  <Input type="number" defaultValue={30} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Send warning before breach (minutes)</Label>
                  <Input type="number" defaultValue={60} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Escalation target</Label>
                  <Select defaultValue="supervisor">
                    <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save SLA Configuration
          </Button>
        </TabsContent>

        {/* Email */}
        <TabsContent value="email" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Email Templates</h3>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Add Template
            </Button>
          </div>
          <Card className="border">
            <CardContent className="p-0">
              <div className="divide-y">
                {emailTemplates.map((tmpl) => (
                  <div key={tmpl.id} className="flex items-center justify-between p-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{tmpl.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground truncate max-w-md">
                        {tmpl.subject}
                      </p>
                      <Badge variant="secondary" className="mt-1 text-[10px]">
                        {tmpl.trigger}
                      </Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branding */}
        <TabsContent value="branding" className="mt-6 space-y-4">
          <h3 className="font-semibold">Organization &amp; Branding</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Organization Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Organization Name</Label>
                  <Input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Support Email</Label>
                  <Input value={orgEmail} onChange={(e) => setOrgEmail(e.target.value)} className="h-9" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone Number</Label>
                  <Input value={orgPhone} onChange={(e) => setOrgPhone(e.target.value)} className="h-9" />
                </div>
              </CardContent>
            </Card>

            <Card className="border">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Appearance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Accent Color</Label>
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-primary border" />
                    <Input defaultValue="#7c9e7a" className="h-9 font-mono text-sm" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Logo</Label>
                  <div className="rounded-lg border-2 border-dashed p-4 text-center">
                    <p className="text-xs text-muted-foreground">
                      Drop logo here or click to upload
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <Button className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            Save Changes
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}

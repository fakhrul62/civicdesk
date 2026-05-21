"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MoreHorizontal,
  Eye,
  UserPlus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getStatusLabel,
  getStatusColor,
  getPriorityLabel,
  getPriorityColor,
  timeAgo,
} from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export function AdminTicketsClient({ initialData }: { initialData: any }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = initialData.tickets.filter((t: any) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.citizen?.full_name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || t.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || t.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const toggleAll = () => {
    if (selected.length === filtered.length) {
      setSelected([]);
    } else {
      setSelected(filtered.map((t: any) => t.id));
    }
  };

  const toggleOne = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
          <p className="text-sm text-muted-foreground">
            Manage all citizen complaints and service requests.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {selected.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            placeholder="Search tickets, citizens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-9 pl-8 text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[150px] text-sm">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="submitted">Submitted</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending_citizen">Pending Citizen</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="h-9 w-full sm:w-[140px] text-sm">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priorities</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={selected.length === filtered.length && filtered.length > 0}
                  onCheckedChange={toggleAll}
                />
              </TableHead>
              <TableHead className="text-xs">Ticket</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Citizen</TableHead>
              <TableHead className="text-xs">Status</TableHead>
              <TableHead className="text-xs hidden sm:table-cell">Priority</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Category</TableHead>
              <TableHead className="text-xs hidden lg:table-cell">Agent</TableHead>
              <TableHead className="text-xs hidden md:table-cell">Updated</TableHead>
              <TableHead className="w-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((ticket: any) => (
              <TableRow
                key={ticket.id}
                className={cn(
                  "transition-colors",
                  selected.includes(ticket.id) && "bg-primary/5"
                )}
              >
                <TableCell>
                  <Checkbox
                    checked={selected.includes(ticket.id)}
                    onCheckedChange={() => toggleOne(ticket.id)}
                  />
                </TableCell>
                <TableCell>
                  <Link
                    href={`/admin/tickets/${ticket.id}`}
                    className="hover:underline"
                  >
                    <p className="text-xs font-mono text-muted-foreground">
                      {ticket.ticket_number}
                    </p>
                    <p className="text-sm font-medium truncate max-w-[200px] sm:max-w-[300px]">
                      {ticket.title}
                    </p>
                  </Link>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <p className="text-sm">{ticket.citizen?.full_name}</p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", getStatusColor(ticket.status))}
                  >
                    {getStatusLabel(ticket.status)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Badge
                    variant="outline"
                    className={cn("text-[10px]", getPriorityColor(ticket.priority))}
                  >
                    {getPriorityLabel(ticket.priority)}
                  </Badge>
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                  {ticket.category?.name}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-sm">
                  {ticket.assigned_agent?.full_name || (
                    <span className="text-muted-foreground">Unassigned</span>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                  {timeAgo(ticket.updated_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/tickets/${ticket.id}`}>
                          <Eye className="mr-2 h-3.5 w-3.5" />
                          View Details
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/tickets/${ticket.id}`}>
                          <UserPlus className="mr-2 h-3.5 w-3.5" />
                          Manage Assignment
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filtered.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center text-sm text-muted-foreground">
                  No tickets found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Showing {filtered.length} of {initialData.total} tickets</span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled className="h-7 text-xs">
            Previous
          </Button>
          <Button variant="outline" size="sm" className="h-7 text-xs">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}

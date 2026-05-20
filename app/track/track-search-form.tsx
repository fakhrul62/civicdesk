"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function TrackSearchForm({ ticketNumber }: { ticketNumber: string }) {
  const [searching, setSearching] = useState(false);

  return (
    <form
      className="mb-8 flex items-center gap-2 rounded-lg border bg-card p-1.5 shadow-sm"
      onSubmit={() => setSearching(true)}
    >
      <div className="flex flex-1 items-center gap-2 px-2">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          name="id"
          type="text"
          placeholder="Enter your ticket ID"
          defaultValue={ticketNumber}
          className="border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
        />
      </div>
      <Button size="sm" type="submit" disabled={searching}>
        {searching ? (
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : (
          "Track"
        )}
      </Button>
    </form>
  );
}

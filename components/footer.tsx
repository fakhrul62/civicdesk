import { Landmark } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Landmark className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="font-semibold tracking-tight">
                Civic<span className="text-primary">Desk</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Government complaint management portal. Submit, track, and resolve civic issues transparently.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Quick Links</h4>
            <nav className="flex flex-col gap-2">
              <Link href="/submit" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Submit a Complaint
              </Link>
              <Link href="/track" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Track Your Complaint
              </Link>
              <Link href="/dashboard" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                Citizen Dashboard
              </Link>
            </nav>
          </div>

          {/* Resources */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Resources</h4>
            <nav className="flex flex-col gap-2">
              <span className="text-sm text-muted-foreground">Help Center</span>
              <span className="text-sm text-muted-foreground">Privacy Policy</span>
              <span className="text-sm text-muted-foreground">Terms of Service</span>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Contact</h4>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Civic Service Center</p>
              <p>1-800-CIVIC-01</p>
              <p>support@civicdesk.gov</p>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6 text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} CivicDesk. Government of the People. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

import Link from "next/link";
import { ArrowLeft, Landmark, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <Card className="relative z-10 w-full max-w-md border shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Landmark className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Reset your password</CardTitle>
          <p className="text-sm text-muted-foreground">
            Password reset is temporarily handled by the CivicDesk support team.
          </p>
        </CardHeader>
        <CardContent className="space-y-4 pt-4">
          <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
            <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
              <Mail className="h-4 w-4" />
              Contact support
            </div>
            Send your account email to the CivicDesk administrator and request a password reset.
          </div>

          <Button asChild className="w-full gap-2">
            <Link href="/login">
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

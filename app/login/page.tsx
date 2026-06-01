"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Landmark,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  LogIn,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { signIn } from "@/actions/auth";
import { useLanguage } from "@/components/language-provider";

export default function LoginPage() {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setLoadingMessage(t("login.checking"));

    try {
      const result = await signIn({ email, password });

      if ("error" in result && result.error) {
        setError(result.error);
        setLoading(false);
        setLoadingMessage("");
      } else if (result.redirect) {
        const requestedRedirect = new URLSearchParams(window.location.search).get("redirect");
        const target =
          requestedRedirect && requestedRedirect.startsWith("/")
            ? requestedRedirect
            : result.redirect;

        setLoadingMessage(t("login.opening"));
        window.dispatchEvent(new Event("civicdesk:navigation-start"));
        window.location.assign(target);
        return;
      }
    } catch {
      setError(t("login.unexpected"));
      setLoading(false);
      setLoadingMessage("");
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      {loading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
          <div className="w-full max-w-xs rounded-lg border bg-card p-6 text-center shadow-lg">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
            <p className="mt-4 text-sm font-medium">{loadingMessage || t("login.loading")}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {t("login.keepOpen")}
            </p>
          </div>
        </div>
      )}

      {/* Background grid */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(to_right,var(--color-border)_1px,transparent_1px),linear-gradient(to_bottom,var(--color-border)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />

      <Card className="relative z-10 w-full max-w-md border shadow-lg">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Landmark className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">
            {t("login.welcome")}{" "}
            <span className="text-primary">CivicDesk</span>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {t("login.subtitle")}
          </p>
        </CardHeader>

        <CardContent className="pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm">
                {t("login.email")}
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm">
                  {t("login.password")}
                </Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-primary hover:underline"
                >
                  {t("login.forgot")}
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t("login.passwordPlaceholder")}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? t("login.signingIn") : t("login.signIn")}
            </Button>
          </form>

          <Separator className="my-6" />

          <div className="space-y-3 text-center text-sm">
            <p className="text-muted-foreground">
              {t("login.noAccount")}{" "}
              <Link
                href="/signup"
                className="font-medium text-primary hover:underline"
              >
                {t("login.createOne")}
              </Link>
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowRight className="h-3 w-3 rotate-180" />
              {t("login.backHome")}
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

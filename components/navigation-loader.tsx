"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { useLanguage } from "@/components/language-provider";

function isInternalUrl(href: string) {
  try {
    const url = new URL(href, window.location.href);
    return url.origin === window.location.origin;
  } catch {
    return false;
  }
}

function isSamePageHash(href: string) {
  const url = new URL(href, window.location.href);
  return (
    url.pathname === window.location.pathname &&
    url.search === window.location.search &&
    Boolean(url.hash)
  );
}

export function NavigationLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { t } = useLanguage();
  const routeKey = useMemo(
    () => `${pathname}?${searchParams.toString()}`,
    [pathname, searchParams]
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(false);
  }, [routeKey]);

  useEffect(() => {
    const start = () => setLoading(true);
    const stop = () => setLoading(false);

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      const href = anchor.href;
      if (
        anchor.target ||
        anchor.hasAttribute("download") ||
        !isInternalUrl(href) ||
        isSamePageHash(href)
      ) {
        return;
      }

      start();
    };

    const handleSubmit = (event: SubmitEvent) => {
      if (event.defaultPrevented) return;

      const form = event.target as HTMLFormElement | null;
      if (!form) return;

      const action = form.getAttribute("action");
      if (!action || isInternalUrl(action)) {
        start();
      }
    };

    window.addEventListener("civicdesk:navigation-start", start);
    window.addEventListener("pageshow", stop);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("submit", handleSubmit, true);

    return () => {
      window.removeEventListener("civicdesk:navigation-start", start);
      window.removeEventListener("pageshow", stop);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("submit", handleSubmit, true);
    };
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 px-4 backdrop-blur-sm">
      <div className="w-full max-w-xs rounded-lg border bg-card p-6 text-center shadow-lg">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary/25 border-t-primary" />
        <p className="mt-4 text-sm font-medium">{t("loader.title")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t("loader.body")}
        </p>
      </div>
    </div>
  );
}

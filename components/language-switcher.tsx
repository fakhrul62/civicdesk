"use client";

import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/components/language-provider";

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { language, setLanguage, t } = useLanguage();
  const nextLanguage = language === "en" ? "bn" : "en";

  return (
    <Button
      type="button"
      variant="outline"
      size={compact ? "sm" : "default"}
      className="gap-1.5"
      onClick={() => setLanguage(nextLanguage)}
      aria-label={`Switch language to ${t("language.switchTo")}`}
    >
      <Languages className="h-3.5 w-3.5" />
      <span className="text-xs font-semibold">{language === "en" ? "বাংলা" : "EN"}</span>
    </Button>
  );
}

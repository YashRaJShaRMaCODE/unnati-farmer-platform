"use client";

import { Languages } from "lucide-react";
import { useLanguage } from "@/providers/language-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export function LanguageToggle({ className }: { className?: string }) {
  const { locale, setLocale, t } = useLanguage();

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50/60 p-0.5",
        className
      )}
      role="group"
      aria-label={t("layout.language")}
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setLocale("en")}
        className={cn(
          "h-8 min-w-[2.5rem] rounded-md px-2 text-xs font-semibold",
          locale === "en"
            ? "bg-white text-emerald-900 shadow-sm"
            : "text-emerald-700 hover:bg-emerald-100/80"
        )}
      >
        EN
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setLocale("hi")}
        className={cn(
          "h-8 min-w-[2.5rem] rounded-md px-2 text-xs font-semibold",
          locale === "hi"
            ? "bg-white text-emerald-900 shadow-sm"
            : "text-emerald-700 hover:bg-emerald-100/80"
        )}
      >
        हिं
      </Button>
      <Languages className="hidden h-4 w-4 text-emerald-600 sm:block" aria-hidden />
    </div>
  );
}

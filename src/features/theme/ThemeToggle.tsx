"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";
import { cn } from "@/lib/cn";
import { getServerTheme, getTheme, setTheme, subscribeTheme } from "./theme";

/**
 * Sun/moon segmented switch. One button (one tab stop) whose label names
 * the action; the filled segment shows the active theme.
 */
export function ThemeToggle({
  labels,
  className,
}: {
  labels: { toLight: string; toDark: string };
  className?: string;
}) {
  const theme = useSyncExternalStore(subscribeTheme, getTheme, getServerTheme);
  const next = theme === "dark" ? "light" : "dark";
  const label = theme === "dark" ? labels.toLight : labels.toDark;

  const segment =
    "inline-flex size-9 items-center justify-center rounded-full transition-[background-color,color,box-shadow] duration-(--duration-base) ease-(--ease-cinematic)";

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      data-theme-toggle={theme}
      className={cn(
        "inline-flex h-11 shrink-0 items-center gap-0.5 rounded-full border border-bronze/70 p-0.5 transition-colors duration-(--duration-base) hover:border-gold light:border-grey light:bg-charcoal light:shadow-soft",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          segment,
          theme === "light" ? "bg-flame/12 text-flame" : "text-mist max-xl:hidden",
        )}
      >
        <Sun className="size-[1.1rem]" strokeWidth={1.75} />
      </span>
      <span
        aria-hidden="true"
        className={cn(
          segment,
          theme === "dark" ? "bg-gold text-charcoal" : "text-mist max-xl:hidden",
        )}
      >
        <Moon className="size-4" strokeWidth={1.75} />
      </span>
    </button>
  );
}

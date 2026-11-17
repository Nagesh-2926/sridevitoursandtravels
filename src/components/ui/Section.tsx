import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Dark section surfaces from the Luxury Dark system (see globals.css). */
type Tone = "charcoal" | "midnight" | "atmos" | "stone";

const tones: Record<Tone, string> = {
  charcoal: "surface-charcoal",
  midnight: "surface-midnight",
  atmos: "surface-atmos vignette",
  stone: "surface-stone",
};

export function Container({ className, ...rest }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mx-auto w-full max-w-content px-5 sm:px-8 lg:px-10", className)}
      {...rest}
    />
  );
}

export function Section({
  tone = "charcoal",
  className,
  children,
  ...rest
}: { tone?: Tone; children: ReactNode } & ComponentProps<"section">) {
  return (
    <section
      className={cn(tones[tone], "grain relative py-20 text-fog sm:py-28", className)}
      {...rest}
    >
      {/* Content sits above the grain and vignette layers. */}
      <div className="relative z-[2]">{children}</div>
    </section>
  );
}

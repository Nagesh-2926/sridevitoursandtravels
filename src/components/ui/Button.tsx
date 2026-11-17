import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "accent" | "outline" | "outlineLight" | "quiet";
type Size = "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2.5 rounded-full font-medium tracking-wide whitespace-nowrap transition-[background-color,border-color,color,transform] duration-(--duration-base) ease-(--ease-cinematic) active:translate-y-px disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  /** Copper-gold CTA. */
  primary: "bg-gold text-charcoal shadow-soft hover:bg-gold-soft",
  /** Alias of primary, kept for existing call sites. */
  accent: "bg-gold text-charcoal shadow-soft hover:bg-gold-soft",
  /** Bronze hairline on dark. */
  outline: "border border-bronze/70 text-white hover:border-gold hover:bg-white/[0.04]",
  outlineLight:
    "border border-bronze/70 text-white hover:border-gold hover:bg-white/[0.04]",
  quiet: "text-current underline-offset-4 hover:underline",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[0.95rem]",
};

export const buttonClasses = (variant: Variant = "primary", size: Size = "md") =>
  cn(base, variants[variant], variant !== "quiet" && sizes[size]);

type Shared = { variant?: Variant; size?: Size; icon?: ReactNode; className?: string };

export function Button({
  variant,
  size,
  icon,
  className,
  children,
  type = "button",
  ...rest
}: Shared & ComponentProps<"button">) {
  return (
    <button type={type} className={cn(buttonClasses(variant, size), className)} {...rest}>
      {children}
      {icon}
    </button>
  );
}

/** Internal routes use next/link; tel:, https:, wa.me links render a plain anchor. */
export function ButtonLink({
  variant,
  size,
  icon,
  className,
  children,
  href,
  external,
  ...rest
}: Shared & Omit<ComponentProps<"a">, "href"> & { href: string; external?: boolean }) {
  const classes = cn(buttonClasses(variant, size), className);
  if (href.startsWith("/")) {
    return (
      <Link href={href} className={classes} {...rest}>
        {children}
        {icon}
      </Link>
    );
  }
  return (
    <a
      href={href}
      className={classes}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
      {icon}
    </a>
  );
}

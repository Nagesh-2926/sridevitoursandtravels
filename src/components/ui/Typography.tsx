import type { ComponentProps, ElementType, ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Eyebrow({ className, ...rest }: ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "flex items-center gap-3 text-eyebrow font-semibold uppercase",
        "before:h-px before:w-8 before:bg-current before:opacity-60",
        className,
      )}
      {...rest}
    />
  );
}

const headingSizes = {
  display: "text-display font-light",
  headline: "text-headline font-light",
  title: "text-title font-normal",
} as const;

export function Heading({
  as: Tag = "h2",
  size = "headline",
  className,
  children,
  ...rest
}: {
  as?: ElementType;
  size?: keyof typeof headingSizes;
  className?: string;
  children: ReactNode;
} & Omit<ComponentProps<"h2">, "children">) {
  return (
    <Tag
      className={cn("font-display text-balance", headingSizes[size], className)}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function Lead({ className, ...rest }: ComponentProps<"p">) {
  return <p className={cn("max-w-prose text-lead text-pretty", className)} {...rest} />;
}

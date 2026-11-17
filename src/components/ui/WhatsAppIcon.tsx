import type { ComponentProps } from "react";

/** Monochrome chat/telephone mark, inheriting the active theme's icon color. */
export function WhatsAppIcon(props: ComponentProps<"svg">) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.5 11.5a8.5 8.5 0 0 1-12.6 7.4L3 20.5l1.6-4.8A8.5 8.5 0 1 1 20.5 11.5Z" />
      <path d="m8.3 7.5 1.4 2.2-.9 1.2a8 8 0 0 0 3.8 3.8l1.2-.9 2.2 1.4c.2 1.5-.7 2.1-1.9 1.9-3.7-.6-7.1-4-7.7-7.7-.2-1.2.4-2.1 1.9-1.9Z" />
    </svg>
  );
}

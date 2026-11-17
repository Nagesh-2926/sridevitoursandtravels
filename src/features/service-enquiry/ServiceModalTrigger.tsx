"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import type { ServiceId } from "@/config/services";
import { useServiceModal } from "./ServiceModal";

/**
 * A real link to the contact page (works without JavaScript) that opens
 * the service's enquiry modal instead when the modal is available.
 * Modified clicks (new tab/window) keep the normal link behaviour.
 */
export function ServiceModalTrigger({
  serviceId,
  href,
  onClick,
  ...rest
}: { serviceId: ServiceId; href: string } & Omit<ComponentProps<typeof Link>, "href">) {
  const open = useServiceModal();
  return (
    <Link
      href={href}
      aria-haspopup={open ? "dialog" : undefined}
      onClick={(event: MouseEvent<HTMLAnchorElement>) => {
        onClick?.(event);
        if (!open || event.defaultPrevented) return;
        if (
          event.metaKey ||
          event.ctrlKey ||
          event.shiftKey ||
          event.altKey ||
          event.button !== 0
        ) {
          return;
        }
        event.preventDefault();
        open(serviceId, event.currentTarget);
      }}
      {...rest}
    />
  );
}

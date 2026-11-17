"use client";

import { X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { services, type ServiceId } from "@/config/services";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { format } from "@/i18n/format";
import { ServiceEnquiryForm } from "./ServiceEnquiryForm";

export type ServiceModalCopy = Pick<Dictionary, "enquiry" | "services" | "a11y"> & {
  ready: Dictionary["contact"]["form"]["ready"];
};

type OpenFn = (serviceId: ServiceId, trigger?: HTMLElement | null) => void;
const ServiceModalContext = createContext<OpenFn | null>(null);

/** Opens the service enquiry modal; null when rendered outside the provider. */
export const useServiceModal = () => useContext(ServiceModalContext);

/**
 * One native <dialog> for the whole site, opened with showModal(): the top
 * layer gives an inert page and a ::backdrop. An explicit boundary loop
 * keeps Tab inside the content instead of moving to browser chrome.
 * Focus returns to the trigger on close.
 */
export function ServiceModalProvider({
  copy,
  children,
}: {
  copy: ServiceModalCopy;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState<{ id: ServiceId; key: number } | null>(null);

  const open = useCallback<OpenFn>((serviceId, trigger) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setActive((prev) => ({ id: serviceId, key: (prev?.key ?? 0) + 1 }));
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  // Open after the content for the chosen service has rendered.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!active || !dialog || dialog.open) return;
    dialog.showModal();
    const first = dialog.querySelector<HTMLElement>("input, select, textarea");
    const finePointer = window.matchMedia("(pointer: fine)").matches;
    // Avoid popping the on-screen keyboard on touch devices.
    (finePointer && first
      ? first
      : dialog.querySelector<HTMLElement>("[data-modal-title]")
    )?.focus();
  }, [active]);

  return (
    <ServiceModalContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby={active ? "service-modal-title" : undefined}
        aria-describedby={active ? "service-modal-intro" : undefined}
        className="modal liquid-glass sheen m-auto max-h-[min(92dvh,56rem)] w-[min(calc(100%-1.5rem),42rem)] flex-col overflow-hidden rounded-panel p-0 text-fog open:flex"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Tab") {
            const controls = Array.from(
              event.currentTarget.querySelectorAll<HTMLElement>(
                'a[href], button:not(:disabled), input:not(:disabled):not([type="hidden"]), select:not(:disabled), textarea:not(:disabled), [tabindex="0"]',
              ),
            ).filter(
              (element) => element.tabIndex >= 0 && element.getClientRects().length > 0,
            );
            const first = controls[0];
            const last = controls.at(-1);
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last?.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first?.focus();
            }
          }
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
        // A click whose target is the dialog itself landed on the backdrop.
        onClick={(event) => event.target === event.currentTarget && close()}
        onClose={() => {
          triggerRef.current?.focus({ preventScroll: true });
          triggerRef.current = null;
        }}
      >
        {active && (
          <ServiceModalBody
            key={active.key}
            serviceId={active.id}
            copy={copy}
            onClose={close}
          />
        )}
      </dialog>
    </ServiceModalContext.Provider>
  );
}

function ServiceModalBody({
  serviceId,
  copy,
  onClose,
}: {
  serviceId: ServiceId;
  copy: ServiceModalCopy;
  onClose: () => void;
}) {
  const service = services.find((s) => s.id === serviceId)!;
  const title = format(copy.enquiry.modalTitle, {
    service: copy.services.items[serviceId].title,
  });
  return (
    <>
      <ModalHeader
        title={title}
        intro={copy.enquiry.modalIntro}
        icon={<ServiceIcon name={service.icon} className="size-7 text-gold" />}
        closeLabel={copy.enquiry.close}
        onClose={onClose}
        badge={service.assistanceOnly ? copy.services.assistanceBadge : undefined}
      />
      {/* The only scroll container, so there is no nested scrolling. */}
      <div className="overflow-y-auto overscroll-contain px-5 pt-2 pb-6 sm:px-8 sm:pb-8">
        <ServiceEnquiryForm serviceId={serviceId} copy={copy} />
      </div>
    </>
  );
}

export function ModalHeader({
  title,
  intro,
  icon,
  badge,
  closeLabel,
  onClose,
}: {
  title: string;
  intro: string;
  icon: ReactNode;
  badge?: string;
  closeLabel: string;
  onClose: () => void;
}) {
  return (
    <header className="flex shrink-0 items-start gap-4 border-b border-white/10 px-5 py-5 sm:px-8 sm:py-6">
      <span className="mt-1 hidden size-12 shrink-0 items-center justify-center rounded-full border border-bronze/60 bg-charcoal/50 xs:inline-flex">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        {badge && (
          <span className="mb-2 inline-flex rounded-full border border-gold/40 px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-gold uppercase">
            {badge}
          </span>
        )}
        <h2
          id="service-modal-title"
          data-modal-title=""
          tabIndex={-1}
          className="font-display text-title text-white outline-none"
        >
          {title}
        </h2>
        <p id="service-modal-intro" className="mt-2 text-label text-mist">
          {intro}
        </p>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={closeLabel}
        className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold hover:text-white"
      >
        <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
      </button>
    </header>
  );
}

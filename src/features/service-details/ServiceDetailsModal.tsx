"use client";

import { ArrowUpRight, X } from "lucide-react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from "react";
import { ServiceIcon } from "@/components/ui/ServiceIcon";
import { guidanceFor, requirementsFor, sectionFor } from "@/config/service-details";
import { services, type ServiceId } from "@/config/services";
import { useServiceModal } from "@/features/service-enquiry/ServiceModal";
import { localizedHref, type Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries/en";

type OpenServiceDetails = (serviceId: ServiceId, trigger?: HTMLElement | null) => void;
const ServiceDetailsContext = createContext<OpenServiceDetails | null>(null);

export function useServiceDetailsModal() {
  return useContext(ServiceDetailsContext);
}

export function ServiceDetailsTrigger({
  serviceId,
  label,
}: {
  serviceId: ServiceId;
  label: string;
}) {
  const openDetails = useServiceDetailsModal();
  return (
    <button
      type="button"
      onClick={(event) => openDetails?.(serviceId, event.currentTarget)}
      aria-haspopup="dialog"
      className="mt-4 inline-flex min-h-11 items-center gap-1.5 self-start text-label font-medium text-gold transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
    >
      {label}
      <ArrowUpRight aria-hidden="true" className="size-4" strokeWidth={1.5} />
    </button>
  );
}

export function ServiceDetailsModalProvider({
  locale,
  copy,
  closeLabel,
  children,
}: {
  locale: Locale;
  copy: Dictionary["services"];
  closeLabel: string;
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const [serviceId, setServiceId] = useState<ServiceId | null>(null);
  const openEnquiry = useServiceModal();

  const open = useCallback<OpenServiceDetails>((id, trigger) => {
    triggerRef.current = trigger ?? (document.activeElement as HTMLElement | null);
    setServiceId(id);
  }, []);

  const close = useCallback(() => dialogRef.current?.close(), []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!serviceId || !dialog || dialog.open) return;
    dialog.showModal();
    dialog.querySelector<HTMLElement>("[data-service-details-title]")?.focus();
  }, [serviceId]);

  return (
    <ServiceDetailsContext.Provider value={open}>
      {children}
      <dialog
        ref={dialogRef}
        aria-labelledby="service-details-title"
        data-service-details-modal=""
        data-service-id={serviceId ?? undefined}
        className="modal service-details-modal m-auto max-h-[85dvh] w-[min(calc(100%-2rem),46rem)] overflow-hidden rounded-panel p-0 text-fog"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            close();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
        onClose={() => {
          setServiceId(null);
          triggerRef.current?.focus({ preventScroll: true });
          triggerRef.current = null;
        }}
      >
        {serviceId && (
          <ServiceDetailsModal
            serviceId={serviceId}
            locale={locale}
            copy={copy}
            closeLabel={closeLabel}
            enquiryAvailable={Boolean(openEnquiry)}
            onClose={close}
            onEnquire={(id) => {
              const trigger = triggerRef.current;
              close();
              openEnquiry?.(id, trigger);
            }}
          />
        )}
      </dialog>
    </ServiceDetailsContext.Provider>
  );
}

function ServiceDetailsModal({
  serviceId,
  locale,
  copy,
  closeLabel,
  enquiryAvailable,
  onClose,
  onEnquire,
}: {
  serviceId: ServiceId;
  locale: Locale;
  copy: Dictionary["services"];
  closeLabel: string;
  enquiryAvailable: boolean;
  onClose: () => void;
  onEnquire: (serviceId: ServiceId) => void;
}) {
  const service = services.find((item) => item.id === serviceId);
  if (!service) return null;

  const { title, summary } = copy.items[serviceId];
  const requirements = requirementsFor(serviceId, locale);
  const guidance = guidanceFor(serviceId, locale);
  const sectionLabel =
    sectionFor(serviceId) === "preparation" ? copy.preparationLabel : copy.documentsLabel;
  const enquiryHref = `${localizedHref(locale, "/contact")}?service=${serviceId}`;

  return (
    <div className="flex max-h-[85dvh] flex-col">
      <header className="flex shrink-0 items-start gap-4 border-b border-gold/20 px-5 py-5 sm:px-8 sm:py-6">
        <span className="mt-1 inline-flex size-12 shrink-0 items-center justify-center rounded-full border border-gold/35 bg-white/5">
          <ServiceIcon name={service.icon} className="size-6 text-gold" />
        </span>
        <div className="min-w-0 flex-1">
          {service.assistanceOnly && (
            <span className="mb-2 inline-flex rounded-full border border-gold/40 px-2.5 py-0.5 text-[0.6875rem] font-medium tracking-wide text-gold uppercase">
              {copy.assistanceBadge}
            </span>
          )}
          <h2
            id="service-details-title"
            data-service-details-title=""
            tabIndex={-1}
            className="font-display text-title text-white outline-none"
          >
            {title}
          </h2>
          <p className="mt-2 text-label leading-relaxed text-mist">{summary}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label={closeLabel}
          className="-mt-1 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/80 transition-colors hover:border-gold hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
        >
          <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
        </button>
      </header>

      <div className="min-h-0 overflow-y-auto overscroll-contain px-5 py-6 sm:px-8 sm:py-7">
        <h3 className="font-semibold text-white">{sectionLabel}</h3>
        <ul className="mt-4 list-disc space-y-3 pl-5 text-sm leading-relaxed text-mist marker:text-gold">
          {requirements.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        {guidance && (
          <p className="mt-5 rounded-plaque border border-gold/20 bg-white/[0.035] p-4 text-sm leading-relaxed text-mist">
            {guidance}
          </p>
        )}
        <a
          href={enquiryHref}
          onClick={(event: MouseEvent<HTMLAnchorElement>) => {
            if (!enquiryAvailable) return;
            event.preventDefault();
            onEnquire(serviceId);
          }}
          className="mt-7 inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-gold/50 bg-gold/10 px-6 font-semibold text-gold transition-colors hover:border-gold hover:bg-gold/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          {copy.enquireOnWhatsApp}
          <ArrowUpRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </div>
  );
}

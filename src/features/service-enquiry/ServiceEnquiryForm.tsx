"use client";

import { CircleCheck, Mail, MessageCircle } from "lucide-react";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import type { ServiceId } from "@/config/services";
import { site } from "@/config/site";
import { buildEmailComposeLinks } from "@/features/enquiries/email";
import { format } from "@/i18n/format";
import {
  buildEnquiryMessage,
  formFields,
  kindForService,
  localToday,
  validateEnquiry,
  whatsappUrl,
  type FieldErrors,
} from "./schema";
import { ServiceFormFields } from "./ServiceFormFields";
import type { ServiceModalCopy } from "./ServiceModal";
import { useServiceDraft } from "./useServiceDraft";

function initialValues(serviceId: ServiceId): Record<string, string> {
  const kind = kindForService(serviceId);
  if (kind === "flight") return { tripType: "oneWay", passengers: "1" };
  if (kind === "train") return { travelClass: "any", passengers: "1" };
  if (kind === "bus") return { busCategory: "any", passengers: "1" };
  if (kind === "darshanam") return { temple: "tirumala", devotees: "1" };
  return { digitalService: serviceId };
}

function openWhatsApp(url: string) {
  const opened = window.open(url, "_blank");
  if (!opened) return false;
  opened.opener = null;
  return true;
}

/**
 * Validates a service-specific enquiry and hands it to WhatsApp. Draft data
 * is stored only in this browser and is removed after 24 hours of inactivity.
 */
export function ServiceEnquiryForm({
  serviceId,
  copy,
}: {
  serviceId: ServiceId;
  copy: ServiceModalCopy;
}) {
  const kind = kindForService(serviceId);
  const defaults = useMemo(() => initialValues(serviceId), [serviceId]);
  const { values, ready, saveState, lastSavedAt, update, reset } = useServiceDraft(
    serviceId,
    defaults,
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [readyUrls, setReadyUrls] = useState<{
    whatsapp: string;
    mailto: string;
    gmail: string;
  } | null>(null);
  const [clearNotice, setClearNotice] = useState<string | null>(null);
  const [submissionCleared, setSubmissionCleared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [today] = useState(localToday);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const clearDialogRef = useRef<HTMLDialogElement>(null);
  const submissionStartedRef = useRef(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionStartedRef.current || isSubmitting || !ready) return;
    const visible = formFields[kind].filter(
      (f) => !f.visibleWhen || f.visibleWhen(values),
    );
    const submitted = Object.fromEntries(
      visible.map((f) => [f.name, values[f.name] ?? ""]),
    );
    const result = validateEnquiry(kind, submitted, today);
    if (!result.ok) {
      setErrors(result.errors);
      setReadyUrls(null);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    const message = buildEnquiryMessage(kind, serviceId, result.data, copy);
    const url = whatsappUrl(site.whatsappE164, message);
    const emailLinks = buildEmailComposeLinks(message);
    submissionStartedRef.current = true;
    const whatsappOpened = openWhatsApp(url);
    if (!whatsappOpened) {
      submissionStartedRef.current = false;
    } else {
      setIsSubmitting(true);
    }
    // Pop-up blockers can stop window.open silently, so always offer a link.
    setReadyUrls({ whatsapp: url, ...emailLinks });
    if (whatsappOpened) {
      if (reset()) setSubmissionCleared(true);
    }
  }

  function handleChange(name: string, value: string) {
    update(name, value);
    setErrors({});
    setReadyUrls(null);
    setClearNotice(null);
    setSubmissionCleared(false);
    submissionStartedRef.current = false;
    setIsSubmitting(false);
  }

  function confirmClear() {
    clearDialogRef.current?.close();
    if (reset()) {
      setErrors({});
      setReadyUrls(null);
      setClearNotice(copy.enquiry.draft.cleared);
      setSubmissionCleared(false);
      submissionStartedRef.current = false;
      setIsSubmitting(false);
    } else {
      setClearNotice(copy.enquiry.draft.storageError);
    }
  }

  const draft = copy.enquiry.draft;
  const lastSaved = lastSavedAt
    ? format(draft.lastSaved, {
        time: new Date(lastSavedAt).toLocaleString(),
      })
    : null;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="flex flex-col gap-6"
      aria-describedby="service-enquiry-note"
    >
      {hasErrors && (
        <p
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-plaque border border-danger/40 bg-danger/10 p-4 text-sm font-medium text-danger"
        >
          {copy.enquiry.summary}
        </p>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-plaque border border-white/10 bg-white/[0.025] px-4 py-3">
        <div className="min-w-0 text-xs text-mist" data-draft-status aria-live="polite">
          {saveState === "loading" && draft.loading}
          {saveState === "empty" && draft.empty}
          {saveState === "saving" && draft.saving}
          {saveState === "saved" && (
            <span>
              <span className="font-medium text-gold">{draft.saved}</span>
              {lastSaved && <span className="ml-2">{lastSaved}</span>}
            </span>
          )}
          {saveState === "cleared" && (clearNotice ?? draft.cleared)}
          {saveState === "error" && draft.storageError}
          {clearNotice && saveState !== "cleared" && (
            <span className="block text-danger">{clearNotice}</span>
          )}
        </div>
        <button
          type="button"
          disabled={!ready}
          onClick={() => clearDialogRef.current?.showModal()}
          className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-white/20 px-4 text-xs font-semibold text-white/85 transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
        >
          {draft.clearForm}
        </button>
      </div>

      <ServiceFormFields
        fields={formFields[kind]}
        values={values}
        errors={errors}
        copy={copy}
        today={today}
        onChange={handleChange}
        disabled={!ready || isSubmitting}
      />

      <div className="flex flex-col gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={!ready || isSubmitting}
          className="w-full sm:w-auto sm:self-start"
          icon={<MessageCircle aria-hidden="true" className="size-4" strokeWidth={1.5} />}
        >
          {copy.enquiry.submit}
        </Button>
        <p id="service-enquiry-note" className="text-caption text-mist">
          {copy.enquiry.note}
        </p>
      </div>

      <div role="status" aria-live="polite">
        {readyUrls && (
          <div className="flex gap-3 rounded-plaque border border-success/40 bg-success/10 p-4">
            <CircleCheck
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-success"
            />
            <div className="flex flex-col gap-1 text-sm">
              <p className="font-medium text-white">{copy.ready.title}</p>
              <p className="text-fog">{copy.ready.body}</p>
              {submissionCleared && (
                <p className="text-success">{draft.submissionCleared}</p>
              )}
              <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                <a
                  href={readyUrls.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(event) => {
                    if (submissionStartedRef.current) return;
                    event.preventDefault();
                    if (openWhatsApp(readyUrls.whatsapp)) {
                      submissionStartedRef.current = true;
                      if (reset()) setSubmissionCleared(true);
                    }
                  }}
                  className="inline-flex min-h-11 items-center self-start font-medium text-gold underline underline-offset-4"
                >
                  {copy.ready.fallback}
                  <span className="sr-only"> {copy.a11y.opensInNewTab}</span>
                </a>
                <a
                  href={readyUrls.mailto}
                  className="inline-flex min-h-11 items-center gap-2 self-start font-medium text-gold underline underline-offset-4"
                >
                  <Mail aria-hidden="true" className="size-4" />
                  {copy.ready.emailFallback}
                </a>
                <a
                  href={readyUrls.gmail}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center self-start font-medium text-gold underline underline-offset-4"
                >
                  {copy.ready.gmailCompose}
                  <span className="sr-only"> {copy.a11y.opensInNewTab}</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      <dialog
        ref={clearDialogRef}
        aria-labelledby="clear-service-form-title"
        aria-describedby="clear-service-form-description"
        className="modal service-clear-dialog m-auto w-[min(calc(100%-2rem),28rem)] rounded-panel p-6 text-fog"
        onCancel={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.preventDefault();
            clearDialogRef.current?.close();
          }
        }}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            clearDialogRef.current?.close();
          }
        }}
      >
        <h2 id="clear-service-form-title" className="font-display text-xl text-white">
          {draft.clearTitle}
        </h2>
        <p
          id="clear-service-form-description"
          className="mt-3 text-sm leading-relaxed text-mist"
        >
          {draft.clearBody}
        </p>
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => clearDialogRef.current?.close()}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/20 px-5 text-sm font-medium text-white transition-colors hover:border-gold/60"
          >
            {draft.cancelClear}
          </button>
          <button
            type="button"
            onClick={confirmClear}
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-danger/45 bg-danger/10 px-5 text-sm font-semibold text-white transition-colors hover:border-danger"
          >
            {draft.confirmClear}
          </button>
        </div>
      </dialog>
    </form>
  );
}

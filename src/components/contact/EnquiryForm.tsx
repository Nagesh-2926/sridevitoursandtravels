"use client";

import { CircleCheck, Mail, MessageCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select, Textarea } from "@/components/ui/Form";
import {
  services,
  ServiceIdSchema,
  type ServiceCategory,
  type ServiceId,
} from "@/config/services";
import { site } from "@/config/site";
import { buildEmailComposeLinks } from "@/features/enquiries/email";
import {
  buildEnquiryEmailBody,
  buildWhatsAppUrl,
  EnquirySchema,
  type EnquiryField,
} from "@/features/enquiries/schema";
import { kindForService, isServiceId } from "@/features/service-enquiry/schema";
import { useServiceDraft } from "@/features/service-enquiry/useServiceDraft";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { format } from "@/i18n/format";

type Props = {
  copy: Dictionary["contact"]["form"];
  draftCopy: Dictionary["enquiry"]["draft"];
  serviceCopy: Dictionary["services"];
};

const groups: Array<{
  category: ServiceCategory;
  labelKey: "travelTitle" | "digitalTitle";
}> = [
  { category: "travel", labelKey: "travelTitle" },
  { category: "digital", labelKey: "digitalTitle" },
];

/**
 * The contact-page enquiry also uses the service-scoped draft store. An
 * unselected form has its own "general" draft until a service is chosen.
 */
export function EnquiryForm({ copy, draftCopy, serviceCopy }: Props) {
  const params = useSearchParams();
  const preselected = ServiceIdSchema.safeParse(params.get("service"));
  const [serviceId, setServiceId] = useState<ServiceId | "">(() =>
    preselected.success ? preselected.data : "",
  );
  const [seedValues, setSeedValues] = useState<Record<string, string> | null>(null);

  function handleServiceChange(
    nextServiceId: ServiceId | "",
    currentValues: Record<string, string>,
    currentDetail: string,
  ) {
    if (!serviceId && nextServiceId) {
      const field = kindForService(nextServiceId) === "digital" ? "requirement" : "notes";
      setSeedValues({
        name: currentValues.name ?? "",
        email: currentValues.email ?? "",
        phone: currentValues.phone ?? "",
        [field]: currentDetail,
      });
    } else {
      setSeedValues(null);
    }
    setServiceId(nextServiceId);
  }

  return (
    <ContactEnquiryForm
      key={serviceId || "general"}
      serviceId={serviceId}
      onServiceChange={handleServiceChange}
      seedValues={seedValues}
      copy={copy}
      draftCopy={draftCopy}
      serviceCopy={serviceCopy}
    />
  );
}

function ContactEnquiryForm({
  serviceId,
  onServiceChange,
  seedValues,
  copy,
  draftCopy,
  serviceCopy,
}: Props & {
  serviceId: ServiceId | "";
  onServiceChange: (
    serviceId: ServiceId | "",
    currentValues: Record<string, string>,
    currentDetail: string,
  ) => void;
  seedValues: Record<string, string> | null;
}) {
  const defaults = useMemo(
    () => ({
      name: "",
      email: "",
      phone: "",
      message: "",
      requirement: "",
      notes: "",
    }),
    [],
  );
  const draftId = serviceId || "general";
  const { values, ready, saveState, lastSavedAt, update, reset } = useServiceDraft(
    draftId,
    defaults,
    seedValues ?? undefined,
  );
  const detailField =
    serviceId && kindForService(serviceId) !== "digital" ? "notes" : "requirement";
  const [errors, setErrors] = useState<Partial<Record<EnquiryField, string>>>({});
  const [readyUrls, setReadyUrls] = useState<{
    whatsapp: string;
    mailto: string;
    gmail: string;
  } | null>(null);
  const [clearNotice, setClearNotice] = useState<string | null>(null);
  const [submissionCleared, setSubmissionCleared] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const summaryRef = useRef<HTMLParagraphElement>(null);
  const clearDialogRef = useRef<HTMLDialogElement>(null);
  const submissionStartedRef = useRef(false);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submissionStartedRef.current || isSubmitting || !ready) return;

    const result = EnquirySchema.safeParse({
      name: values.name ?? "",
      email: values.email ?? "",
      phone: values.phone ?? "",
      serviceId,
      message: values[detailField] ?? values.message ?? "",
    });

    if (!result.success) {
      const next: Partial<Record<EnquiryField, string>> = {};
      for (const issue of result.error.issues) {
        const field = issue.path[0] as EnquiryField;
        next[field] ??= copy.errors[field === "serviceId" ? "service" : field];
      }
      setErrors(next);
      setReadyUrls(null);
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }

    setErrors({});
    const title = serviceCopy.items[result.data.serviceId].title;
    const url = buildWhatsAppUrl(site.whatsappE164, result.data, title);
    const emailLinks = buildEmailComposeLinks(buildEnquiryEmailBody(result.data, title));
    submissionStartedRef.current = true;
    const opened = window.open(url, "_blank");
    if (opened) {
      opened.opener = null;
      setIsSubmitting(true);
      if (reset()) setSubmissionCleared(true);
    } else {
      submissionStartedRef.current = false;
    }
    setReadyUrls({ whatsapp: url, ...emailLinks });
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
      setClearNotice(draftCopy.cleared);
      setSubmissionCleared(false);
      submissionStartedRef.current = false;
      setIsSubmitting(false);
    } else {
      setClearNotice(draftCopy.storageError);
    }
  }

  const lastSaved = lastSavedAt
    ? format(draftCopy.lastSaved, {
        time: new Date(lastSavedAt).toLocaleString(),
      })
    : null;
  const hasErrors = Object.keys(errors).length > 0;

  return (
    <>
      <form
        noValidate
        onSubmit={onSubmit}
        className="flex flex-col gap-6"
        aria-describedby="enquiry-note"
      >
        {hasErrors && (
          <p
            ref={summaryRef}
            tabIndex={-1}
            role="alert"
            className="rounded-plaque border border-danger/40 bg-danger/5 p-4 text-sm font-medium text-danger"
          >
            {copy.summary}
          </p>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-plaque border border-white/10 bg-white/[0.025] px-4 py-3">
          <div className="min-w-0 text-xs text-mist" data-draft-status aria-live="polite">
            {saveState === "loading" && draftCopy.loading}
            {saveState === "empty" && draftCopy.empty}
            {saveState === "saving" && draftCopy.saving}
            {saveState === "saved" && (
              <span>
                <span className="font-medium text-gold">{draftCopy.saved}</span>
                {lastSaved && <span className="ml-2">{lastSaved}</span>}
              </span>
            )}
            {saveState === "cleared" && (clearNotice ?? draftCopy.cleared)}
            {saveState === "error" && draftCopy.storageError}
            {clearNotice && saveState !== "cleared" && (
              <span className="block text-danger">{clearNotice}</span>
            )}
            {submissionCleared && (
              <span className="block">{draftCopy.submissionCleared}</span>
            )}
          </div>
          <button
            type="button"
            disabled={!ready}
            onClick={() => clearDialogRef.current?.showModal()}
            className="inline-flex min-h-10 shrink-0 items-center rounded-full border border-white/20 px-4 text-xs font-semibold text-white/85 transition-colors hover:border-gold/60 hover:text-gold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {draftCopy.clearForm}
          </button>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label={copy.name} error={errors.name} required>
            {(control) => (
              <Input
                {...control}
                name="name"
                value={values.name ?? ""}
                onChange={(event) => handleChange("name", event.currentTarget.value)}
                autoComplete="name"
                required
                disabled={!ready || isSubmitting}
              />
            )}
          </Field>
          <Field label={copy.email} error={errors.email}>
            {(control) => (
              <Input
                {...control}
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email ?? ""}
                onChange={(event) => handleChange("email", event.currentTarget.value)}
                disabled={!ready || isSubmitting}
              />
            )}
          </Field>
          <Field label={copy.phone} hint={copy.phoneHint} error={errors.phone} required>
            {(control) => (
              <Input
                {...control}
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel-national"
                value={values.phone ?? ""}
                onChange={(event) => handleChange("phone", event.currentTarget.value)}
                required
                disabled={!ready || isSubmitting}
              />
            )}
          </Field>
        </div>

        <Field label={copy.service} error={errors.serviceId} required>
          {(control) => (
            <Select
              {...control}
              name="serviceId"
              required
              value={serviceId}
              disabled={!ready || isSubmitting}
              onChange={(event) => {
                const nextId = event.currentTarget.value;
                onServiceChange(
                  isServiceId(nextId) ? nextId : "",
                  values,
                  values[detailField] ?? values.message ?? "",
                );
              }}
            >
              <option value="" disabled>
                {copy.servicePlaceholder}
              </option>
              {groups.map((group) => (
                <optgroup key={group.category} label={serviceCopy[group.labelKey]}>
                  {services
                    .filter((service) => service.category === group.category)
                    .map((service) => (
                      <option key={service.id} value={service.id}>
                        {serviceCopy.items[service.id].title}
                      </option>
                    ))}
                </optgroup>
              ))}
            </Select>
          )}
        </Field>

        <Field
          label={copy.message}
          hint={copy.messageHint}
          error={errors.message}
          required
        >
          {(control) => (
            <Textarea
              {...control}
              name="message"
              rows={5}
              value={values[detailField] ?? values.message ?? ""}
              onChange={(event) => handleChange(detailField, event.currentTarget.value)}
              required
              disabled={!ready || isSubmitting}
            />
          )}
        </Field>

        <div className="flex flex-col items-start gap-3">
          <Button
            type="submit"
            size="lg"
            disabled={!ready || isSubmitting}
            icon={
              <MessageCircle aria-hidden="true" className="size-4" strokeWidth={1.5} />
            }
          >
            {copy.submit}
          </Button>
          <p id="enquiry-note" className="text-sm text-mist">
            {copy.note}
          </p>
        </div>

        <div role="status" aria-live="polite">
          {readyUrls && (
            <div className="flex gap-3 rounded-plaque border border-success/35 bg-success/[0.06] p-4">
              <CircleCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-success"
              />
              <div className="flex flex-col gap-1 text-sm">
                <p className="font-medium text-white">{copy.ready.title}</p>
                <p className="text-mist">{copy.ready.body}</p>
                <div className="mt-1 flex flex-wrap gap-x-5 gap-y-1">
                  <a
                    href={readyUrls.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center self-start font-medium text-gold underline underline-offset-4"
                  >
                    {copy.ready.fallback}
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
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </form>

      <dialog
        ref={clearDialogRef}
        aria-labelledby="contact-clear-form-title"
        className="service-clear-dialog w-[min(calc(100%-2rem),28rem)] rounded-2xl p-6"
      >
        <h3 id="contact-clear-form-title" className="font-display text-xl text-white">
          {draftCopy.clearTitle}
        </h3>
        <p className="mt-3 text-sm leading-6 text-mist">{draftCopy.clearBody}</p>
        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={() => clearDialogRef.current?.close()}
            className="min-h-11 rounded-full border border-white/20 px-4 text-sm font-medium text-white/85 transition-colors hover:border-white/40"
          >
            {draftCopy.cancelClear}
          </button>
          <button
            type="button"
            onClick={confirmClear}
            className="min-h-11 rounded-full border border-gold/50 bg-gold/10 px-4 text-sm font-semibold text-gold transition-colors hover:bg-gold/20"
          >
            {draftCopy.confirmClear}
          </button>
        </div>
      </dialog>
    </>
  );
}

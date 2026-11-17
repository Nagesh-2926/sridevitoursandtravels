import { z } from "zod";
import { serviceIds, servicesByCategory, type ServiceId } from "@/config/services";
import { indianMobile } from "@/features/enquiries/schema";
import type { Dictionary } from "@/i18n/dictionaries/en";

/**
 * Service-specific enquiry forms (Phase 03 modal). One kind per travel
 * service, plus a shared kind for every digital/government service.
 * Deliberately collects no identity-document numbers or uploads.
 */
export type EnquiryKind = "flight" | "train" | "bus" | "darshanam" | "digital";

const travelKinds: Partial<Record<ServiceId, EnquiryKind>> = {
  flights: "flight",
  trains: "train",
  buses: "bus",
  darshanam: "darshanam",
};

export const kindForService = (id: ServiceId): EnquiryKind =>
  travelKinds[id] ?? "digital";

export const digitalServiceIds = servicesByCategory("digital").map((s) => s.id);

export const travelClasses = [
  "any",
  "sleeper",
  "ac3",
  "ac2",
  "ac1",
  "chairCar",
  "secondSitting",
] as const;

export const busCategories = [
  "any",
  "acSleeper",
  "nonAcSleeper",
  "acSeater",
  "nonAcSeater",
] as const;
export const templeDestinations = [
  "tirumala",
  "sabarimala",
  "vadapalli",
  "kashi",
  "simhachalam",
  "vijayawada",
  "srisailam",
  "annavaram",
  "dwarakaTirumala",
  "puri",
] as const;

export type FieldName = keyof Dictionary["enquiry"]["fields"];
export type ErrorCode = keyof Dictionary["enquiry"]["errors"];

type FieldType =
  "text" | "email" | "tel" | "date" | "number" | "select" | "radio" | "textarea";

export type FieldSpec = {
  name: FieldName;
  type: FieldType;
  required: boolean;
  /** Spans one column on wide layouts (pairs sit side by side). */
  half?: boolean;
  autoComplete?: string;
  /** Only rendered (and validated) when this returns true. */
  visibleWhen?: (values: Record<string, string>) => boolean;
};

const contact: FieldSpec[] = [
  { name: "name", type: "text", required: true, half: true, autoComplete: "name" },
  { name: "email", type: "email", required: false, half: true, autoComplete: "email" },
  {
    name: "phone",
    type: "tel",
    required: true,
    half: true,
    autoComplete: "tel-national",
  },
];
const notes: FieldSpec = { name: "notes", type: "textarea", required: false };

export const isRoundTrip = (values: Record<string, string>) =>
  values.tripType === "roundTrip";

export const formFields: Record<EnquiryKind, FieldSpec[]> = {
  flight: [
    ...contact,
    { name: "from", type: "text", required: true, half: true },
    { name: "to", type: "text", required: true, half: true },
    { name: "tripType", type: "radio", required: true },
    { name: "departDate", type: "date", required: true, half: true },
    {
      name: "returnDate",
      type: "date",
      required: true,
      half: true,
      visibleWhen: isRoundTrip,
    },
    { name: "passengers", type: "number", required: true, half: true },
    notes,
  ],
  train: [
    ...contact,
    { name: "fromStation", type: "text", required: true, half: true },
    { name: "toStation", type: "text", required: true, half: true },
    { name: "journeyDate", type: "date", required: true, half: true },
    { name: "travelClass", type: "select", required: true, half: true },
    { name: "passengers", type: "number", required: true, half: true },
    notes,
  ],
  bus: [
    ...contact,
    { name: "busCategory", type: "select", required: true },
    { name: "boarding", type: "text", required: true, half: true },
    { name: "destination", type: "text", required: true, half: true },
    { name: "journeyDate", type: "date", required: true, half: true },
    { name: "passengers", type: "number", required: true, half: true },
    notes,
  ],
  darshanam: [
    ...contact,
    { name: "temple", type: "select", required: true },
    { name: "preferredDate", type: "date", required: true, half: true },
    { name: "devotees", type: "number", required: true, half: true },
    { name: "assistance", type: "textarea", required: true },
    notes,
  ],
  digital: [
    ...contact,
    { name: "digitalService", type: "select", required: true },
    { name: "requirement", type: "textarea", required: true },
    notes,
  ],
};

/** Today's date in the visitor's local time, as YYYY-MM-DD. */
export function localToday(now = new Date()) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

const err = (code: ErrorCode) => ({ error: code });
const text = z.string().trim().min(1, err("required")).max(120, err("required"));
const count = z.coerce
  .number(err("count"))
  .int(err("count"))
  .min(1, err("count"))
  .max(20, err("count"));
const optionalNotes = z.string().trim().max(500).optional().default("");

/** Builds the schema for a kind. `today` is injectable for deterministic tests. */
export function enquirySchema(kind: EnquiryKind, today = localToday()) {
  const date = z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, err("required"))
    .refine((value) => value >= today, err("date"));
  const base = {
    name: z.string().trim().min(1, err("required")).max(80, err("required")),
    email: z
      .string()
      .trim()
      .refine((value) => value === "" || z.email().safeParse(value).success, err("email"))
      .default(""),
    phone: z
      .string()
      .min(1, err("required"))
      .pipe(indianMobile.catch(""))
      .pipe(z.string().min(10, err("phone"))),
    notes: optionalNotes,
  };

  switch (kind) {
    case "flight":
      return z
        .object({
          ...base,
          from: text,
          to: text,
          tripType: z.enum(["oneWay", "roundTrip"], err("required")),
          departDate: date,
          returnDate: z.string().optional(),
          passengers: count,
        })
        .superRefine((data, ctx) => {
          if (data.tripType !== "roundTrip") return;
          const parsed = date.safeParse(data.returnDate ?? "");
          if (!parsed.success) {
            ctx.addIssue({
              code: "custom",
              path: ["returnDate"],
              message: parsed.error.issues[0].message,
            });
          } else if (parsed.data < data.departDate) {
            ctx.addIssue({ code: "custom", path: ["returnDate"], message: "returnDate" });
          }
        });
    case "train":
      return z.object({
        ...base,
        fromStation: text,
        toStation: text,
        journeyDate: date,
        travelClass: z.enum(travelClasses, err("required")),
        passengers: count,
      });
    case "bus":
      return z.object({
        ...base,
        busCategory: z.enum(busCategories, err("required")),
        boarding: text,
        destination: text,
        journeyDate: date,
        passengers: count,
      });
    case "darshanam":
      return z.object({
        ...base,
        temple: z.enum(templeDestinations, err("required")),
        preferredDate: date,
        devotees: count,
        assistance: z.string().trim().min(1, err("required")).max(1000, err("required")),
      });
    case "digital":
      return z.object({
        ...base,
        digitalService: z.enum(
          digitalServiceIds as [ServiceId, ...ServiceId[]],
          err("required"),
        ),
        requirement: z.string().trim().min(1, err("required")).max(1000, err("required")),
      });
  }
}

export type FieldErrors = Partial<Record<FieldName, ErrorCode>>;

/** Validates form values; returns parsed data or per-field error codes. */
export function validateEnquiry(
  kind: EnquiryKind,
  values: Record<string, string>,
  today?: string,
) {
  const result = enquirySchema(kind, today).safeParse(values);
  if (result.success)
    return { ok: true as const, data: result.data as Record<string, unknown> };
  const errors: FieldErrors = {};
  for (const issue of result.error.issues) {
    const field = issue.path[0] as FieldName;
    const code = (issue.message in errorCodes ? issue.message : "required") as ErrorCode;
    errors[field] ??= code;
  }
  return { ok: false as const, errors };
}

const errorCodes: Record<ErrorCode, true> = {
  required: true,
  email: true,
  phone: true,
  date: true,
  returnDate: true,
  count: true,
  text: true,
};

/**
 * Readable WhatsApp message in the visitor's language. Only filled fields
 * are included, in form order, and it always says this is not a booking.
 */
export function buildEnquiryMessage(
  kind: EnquiryKind,
  serviceId: ServiceId,
  data: Record<string, unknown>,
  copy: Pick<Dictionary, "enquiry" | "services">,
) {
  const { enquiry, services } = copy;
  const display = (name: FieldName, value: unknown): string => {
    if (name === "tripType") return enquiry.fields[value as "oneWay" | "roundTrip"];
    if (name === "travelClass")
      return enquiry.classes[value as (typeof travelClasses)[number]];
    if (name === "busCategory")
      return enquiry.busCategories[value as (typeof busCategories)[number]];
    if (name === "temple")
      return enquiry.temples[value as (typeof templeDestinations)[number]];
    if (name === "digitalService") return services.items[value as ServiceId].title;
    return String(value);
  };
  const service =
    services.items[kind === "digital" ? (data.digitalService as ServiceId) : serviceId]
      .title;
  const lines = [enquiry.message.heading.replace("{service}", service), ""];
  for (const field of formFields[kind]) {
    const value = data[field.name];
    if (
      value === undefined ||
      value === "" ||
      (field.visibleWhen && !field.visibleWhen(data as Record<string, string>))
    )
      continue;
    lines.push(`${enquiry.fields[field.name]}: ${display(field.name, value)}`);
  }
  lines.push("", enquiry.message.disclaimer);
  return lines.join("\n");
}

export const whatsappUrl = (e164: string, message: string) =>
  `https://wa.me/${e164}?text=${encodeURIComponent(message)}`;

export const isServiceId = (value: string | null | undefined): value is ServiceId =>
  !!value && (serviceIds as readonly string[]).includes(value);

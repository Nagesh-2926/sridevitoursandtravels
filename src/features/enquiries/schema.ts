import { z } from "zod";
import { ServiceIdSchema } from "@/config/services";

/** Indian mobile: optional +91/0 prefix, then 10 digits starting 6–9. */
export const indianMobile = z
  .string()
  .transform((value) => value.replace(/[\s-]/g, ""))
  .pipe(z.string().regex(/^(?:\+?91|0)?[6-9]\d{9}$/))
  .transform((value) => value.slice(-10));

/**
 * Customer enquiry. Shared by the WhatsApp and email-compose hand-offs and
 * the future server-side enquiry API, so each validates identically.
 * Deliberately collects no identity documents.
 */
export const EnquirySchema = z.object({
  name: z.string().trim().min(1).max(80),
  email: z
    .string()
    .trim()
    .refine((value) => value === "" || z.email().safeParse(value).success)
    .default(""),
  phone: indianMobile,
  serviceId: ServiceIdSchema,
  message: z.string().trim().min(1).max(1000),
});

export type EnquiryInput = z.input<typeof EnquirySchema>;
export type Enquiry = z.output<typeof EnquirySchema>;
export type EnquiryField = keyof EnquiryInput;

export function buildWhatsAppUrl(
  whatsappE164: string,
  enquiry: Enquiry,
  serviceTitle: string,
) {
  const text = [
    `Enquiry — ${serviceTitle}`,
    `Name: ${enquiry.name}`,
    ...(enquiry.email ? [`Email: ${enquiry.email}`] : []),
    `Mobile: ${enquiry.phone}`,
    "",
    enquiry.message,
  ].join("\n");
  return `https://wa.me/${whatsappE164}?text=${encodeURIComponent(text)}`;
}

export function buildEnquiryEmailBody(enquiry: Enquiry, serviceTitle: string) {
  return [
    `Enquiry - ${serviceTitle}`,
    `Name: ${enquiry.name}`,
    ...(enquiry.email ? [`Email: ${enquiry.email}`] : []),
    `Mobile: ${enquiry.phone}`,
    "",
    enquiry.message,
  ].join("\n");
}

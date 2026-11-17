import { z } from "zod";

/**
 * Booking lifecycle (Phase 02+). An enquiry never becomes "confirmed"
 * automatically: only the proprietor can move it forward, and
 * "confirmed" additionally requires a verified payment record.
 */
export const BookingStatusSchema = z.enum([
  "enquiry_received",
  "under_review",
  "quotation_sent",
  "awaiting_payment",
  "payment_verified",
  "confirmed",
  "cancelled",
  "closed",
]);
export type BookingStatus = z.infer<typeof BookingStatusSchema>;

/** Allowed owner-driven transitions. */
export const bookingTransitions: Record<BookingStatus, readonly BookingStatus[]> = {
  enquiry_received: ["under_review", "cancelled"],
  under_review: ["quotation_sent", "cancelled"],
  quotation_sent: ["awaiting_payment", "cancelled", "closed"],
  awaiting_payment: ["payment_verified", "cancelled"],
  payment_verified: ["confirmed", "cancelled"],
  confirmed: ["closed"],
  cancelled: [],
  closed: [],
};

export const canTransition = (from: BookingStatus, to: BookingStatus) =>
  bookingTransitions[from].includes(to);

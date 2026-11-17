import { z } from "zod";

/**
 * Payment records (Phase 02+). A record is never "verified" from client
 * input: online payments are verified server-side against the gateway,
 * office payments are verified by the proprietor.
 */
export const PaymentMethodSchema = z.enum(["online", "office_cash", "office_upi"]);
export const PaymentVerificationSchema = z.enum([
  "unverified",
  "verified",
  "failed",
  "refunded",
]);

export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
export type PaymentVerification = z.infer<typeof PaymentVerificationSchema>;

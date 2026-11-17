import { describe, expect, it } from "vitest";
import { BookingStatusSchema, canTransition } from "./bookings/status";
import { buildEmailComposeLinks } from "./enquiries/email";
import { buildWhatsAppUrl, EnquirySchema } from "./enquiries/schema";

describe("EnquirySchema", () => {
  const valid = {
    name: "Ravi",
    email: "ravi@example.com",
    phone: "+91 96662-70662",
    serviceId: "trains",
    message: "Two tickets to Chennai on Friday",
  };

  it("accepts a valid enquiry and normalises the mobile number", () => {
    expect(EnquirySchema.parse(valid).phone).toBe("9666270662");
  });

  it("allows an optional email and short non-empty names and requirements", () => {
    expect(
      EnquirySchema.parse({
        ...valid,
        name: "A",
        email: "",
        message: "X",
      }),
    ).toMatchObject({ name: "A", email: "", message: "X" });
  });

  it.each(["12345", "5666270662", "96662706621"])("rejects mobile %s", (phone) => {
    expect(EnquirySchema.safeParse({ ...valid, phone }).success).toBe(false);
  });

  it("rejects invalid email addresses", () => {
    expect(EnquirySchema.safeParse({ ...valid, email: "not-an-email" }).success).toBe(
      false,
    );
  });

  it("rejects unknown services", () => {
    expect(EnquirySchema.safeParse({ ...valid, serviceId: "hotels" }).success).toBe(
      false,
    );
  });

  it("builds an encoded WhatsApp hand-off URL", () => {
    const url = buildWhatsAppUrl(
      "919666270662",
      EnquirySchema.parse(valid),
      "Train tickets",
    );
    expect(url.startsWith("https://wa.me/919666270662?text=")).toBe(true);
    expect(decodeURIComponent(url.split("text=")[1])).toContain("Mobile: 9666270662");
    expect(decodeURIComponent(url.split("text=")[1])).toContain(
      "Email: ravi@example.com",
    );
  });

  it("omits an empty optional email from the WhatsApp message", () => {
    const url = buildWhatsAppUrl(
      "919666270662",
      EnquirySchema.parse({ ...valid, email: "" }),
      "Train tickets",
    );
    expect(decodeURIComponent(url)).not.toContain("Email:");
  });

  it("builds encoded default-mail and Gmail compose links for the official address", () => {
    const links = buildEmailComposeLinks("Line 1 & line 2");
    expect(links.mailto).toBe(
      "mailto:sridevitravels1011@gmail.com?subject=Enquiry%20-%20Sridevi%20Tours%20%26%20Travels&body=Line%201%20%26%20line%202",
    );
    expect(links.gmail).toBe(
      "https://mail.google.com/mail/?view=cm&fs=1&to=sridevitravels1011@gmail.com&su=Enquiry%20-%20Sridevi%20Tours%20%26%20Travels&body=Line%201%20%26%20line%202",
    );
  });
});

describe("booking lifecycle", () => {
  it("can only confirm after payment is verified", () => {
    for (const from of BookingStatusSchema.options) {
      expect(canTransition(from, "confirmed")).toBe(from === "payment_verified");
    }
  });

  it("never lets an enquiry jump straight to confirmed", () => {
    expect(canTransition("enquiry_received", "confirmed")).toBe(false);
  });
});

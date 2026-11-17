import { site } from "@/config/site";

export const enquiryEmailSubject = "Enquiry - Sridevi Tours & Travels";

export function buildEmailComposeLinks(body: string) {
  const subject = encodeURIComponent(enquiryEmailSubject);
  const encodedBody = encodeURIComponent(body);

  return {
    mailto: `mailto:${site.email}?subject=${subject}&body=${encodedBody}`,
    gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${site.email}&su=${subject}&body=${encodedBody}`,
  };
}

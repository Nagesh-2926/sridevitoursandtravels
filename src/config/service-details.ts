import type { Locale } from "@/i18n/config";
import type { ServiceId } from "./services";

export type LocalizedChecklist = Readonly<
  Record<Locale, readonly string[]> & {
    note?: Readonly<Record<Locale, string>>;
    section?: "documents" | "preparation";
  }
>;

/**
 * Proprietor-approved preliminary guidance, centralized outside presentation.
 * These lists intentionally collect no document numbers or uploads.
 */
export const serviceDocumentRequirements = {
  passport: {
    en: [
      "10th Class Marks Memo.",
      "Aadhaar Card.",
      "If the 10th Class Marks Memo is unavailable: Aadhaar Card and PAN Card for preliminary review.",
    ],
    te: [
      "10వ తరగతి మార్కుల మెమో.",
      "ఆధార్ కార్డు.",
      "10వ తరగతి మార్కుల మెమో లేకపోతే ప్రాథమిక పరిశీలన కోసం ఆధార్ కార్డు మరియు పాన్ కార్డు.",
    ],
    note: {
      en: "Official acceptance of alternative documents depends on the applicable Passport Seva rules.",
      te: "ప్రత్యామ్నాయ పత్రాల అధికారిక ఆమోదం వర్తించే పాస్‌పోర్ట్ సేవా నిబంధనలపై ఆధారపడుతుంది.",
    },
  },
  pan: {
    en: [
      "Aadhaar Card.",
      "10th Class Marks Memo.",
      "If the 10th Class Marks Memo is unavailable: Voter ID or Ration Card for preliminary review.",
    ],
    te: [
      "ఆధార్ కార్డు.",
      "10వ తరగతి మార్కుల మెమో.",
      "10వ తరగతి మార్కుల మెమో లేకపోతే ప్రాథమిక పరిశీలన కోసం ఓటర్ ఐడీ లేదా రేషన్ కార్డు.",
    ],
    note: {
      en: "Acceptance of alternatives depends on current PAN application requirements.",
      te: "ప్రత్యామ్నాయ పత్రాల ఆమోదం ప్రస్తుత PAN దరఖాస్తు అవసరాలపై ఆధారపడుతుంది.",
    },
  },
  gccMedicalPcc: {
    en: ["GCC Medical — Passport.", "PCC Application — Passport."],
    te: ["GCC మెడికల్ — పాస్‌పోర్ట్.", "PCC దరఖాస్తు — పాస్‌పోర్ట్."],
  },
  xeroxPrinting: {
    en: [
      "Original file or document",
      "Paper size, colour and copy quantity",
      "Do not send sensitive originals unless necessary",
    ],
    te: [
      "అసలు ఫైల్ లేదా పత్రం",
      "పేపర్ పరిమాణం, రంగు, కాపీల సంఖ్య",
      "అవసరం లేకుండా సున్నితమైన అసలు పత్రాలు పంపవద్దు",
    ],
    section: "preparation",
  },
  billPayments: {
    en: [
      "Current bill or consumer/account reference",
      "Registered mobile number when OTP is required",
      "Payment amount is confirmed before submission",
    ],
    te: [
      "ప్రస్తుత బిల్లు లేదా కన్స్యూమర్/ఖాతా రిఫరెన్స్",
      "OTP అవసరమైతే నమోదిత మొబైల్ నంబర్",
      "సమర్పణ ముందు చెల్లింపు మొత్తం నిర్ధారణ",
    ],
    section: "preparation",
  },
  jobApplications: {
    en: [
      "Notification and post details",
      "Education, identity and category records as applicable",
      "Photograph, signature and active email/mobile when requested",
    ],
    te: [
      "నోటిఫికేషన్ మరియు పోస్టు వివరాలు",
      "వర్తించే విద్య, గుర్తింపు, కేటగిరీ ఆధారాలు",
      "అడిగినప్పుడు ఫోటో, సంతకం, పనిచేసే ఇమెయిల్/మొబైల్",
    ],
  },
  resume: {
    en: [
      "Contact, education and experience details",
      "Skills, projects and target role",
      "Certificates are optional unless verification is requested",
    ],
    te: [
      "సంప్రదింపు, విద్య, అనుభవ వివరాలు",
      "నైపుణ్యాలు, ప్రాజెక్టులు, లక్ష్య ఉద్యోగం",
      "ధృవీకరణ అడిగితే తప్ప సర్టిఫికెట్లు ఐచ్ఛికం",
    ],
    section: "preparation",
  },
  eamcet: {
    en: [
      "Passport-size Photograph.",
      "Candidate Signature.",
      "10th Class Marks Memo.",
      "Intermediate Marks Memo.",
      "Caste Certificate (conditional, when required by current application rules).",
      "Income Certificate (conditional, when required by current application rules).",
      "Aadhaar Card.",
    ],
    te: [
      "పాస్‌పోర్ట్ సైజు ఫోటో.",
      "అభ్యర్థి సంతకం.",
      "10వ తరగతి మార్కుల మెమో.",
      "ఇంటర్మీడియట్ మార్కుల మెమో.",
      "కుల ధృవీకరణ పత్రం (ప్రస్తుత దరఖాస్తు నిబంధనల ప్రకారం అవసరమైనప్పుడు మాత్రమే).",
      "ఆదాయ ధృవీకరణ పత్రం (ప్రస్తుత దరఖాస్తు నిబంధనల ప్రకారం అవసరమైనప్పుడు మాత్రమే).",
      "ఆధార్ కార్డు.",
    ],
  },
  counselling: {
    en: [
      "Rank card, hall ticket and counselling notification",
      "Education, residence/local-status, category and income records as applicable",
      "Original/certificate requirements vary by authority and round",
    ],
    te: [
      "ర్యాంక్ కార్డు, హాల్‌టికెట్, కౌన్సెలింగ్ నోటిఫికేషన్",
      "వర్తించే విద్య, నివాసం/స్థానికత, కేటగిరీ, ఆదాయం ఆధారాలు",
      "అధికారం మరియు రౌండ్‌ను బట్టి అసలు/సర్టిఫికెట్ అవసరాలు మారుతాయి",
    ],
  },
  onlineServices: {
    en: [
      "Exact portal or service name",
      "Applicable identity/contact/reference details",
      "OTP, fee and supporting documents depend on the official portal",
    ],
    te: [
      "ఖచ్చితమైన పోర్టల్ లేదా సేవ పేరు",
      "వర్తించే గుర్తింపు/సంప్రదింపు/రిఫరెన్స్ వివరాలు",
      "OTP, ఫీజు, ఆధార పత్రాలు అధికారిక పోర్టల్‌పై ఆధారపడతాయి",
    ],
    section: "preparation",
  },
} as const satisfies Partial<Record<ServiceId, LocalizedChecklist>>;

export type DocumentServiceId = keyof typeof serviceDocumentRequirements;

export function requirementsFor(serviceId: ServiceId, locale: Locale) {
  if (!(serviceId in serviceDocumentRequirements)) return [];
  return serviceDocumentRequirements[serviceId as DocumentServiceId][locale];
}

export function guidanceFor(serviceId: ServiceId, locale: Locale) {
  if (!(serviceId in serviceDocumentRequirements)) return undefined;
  const serviceDetails = serviceDocumentRequirements[
    serviceId as DocumentServiceId
  ] as LocalizedChecklist;
  return serviceDetails.note?.[locale];
}

export function sectionFor(serviceId: ServiceId) {
  if (!(serviceId in serviceDocumentRequirements)) return "documents";
  const serviceDetails = serviceDocumentRequirements[
    serviceId as DocumentServiceId
  ] as LocalizedChecklist;
  return serviceDetails.section ?? "documents";
}

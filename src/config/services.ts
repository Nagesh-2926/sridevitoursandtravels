import { z } from "zod";

/**
 * Typed service catalogue. Presentation copy lives in the i18n
 * dictionaries (keyed by `id`); icons are mapped in the UI layer.
 *
 * Business rules encoded here:
 * - No prices, availability or confirmation states are stored or shown.
 * - Government-related services are application *assistance* only.
 */
export const serviceIds = [
  "flights",
  "trains",
  "buses",
  "darshanam",
  "passport",
  "pan",
  "gccMedicalPcc",
  "xeroxPrinting",
  "billPayments",
  "jobApplications",
  "resume",
  "eamcet",
  "counselling",
  "onlineServices",
] as const;

export const ServiceIdSchema = z.enum(serviceIds);
export type ServiceId = z.infer<typeof ServiceIdSchema>;

export const ServiceCategorySchema = z.enum(["travel", "digital"]);
export type ServiceCategory = z.infer<typeof ServiceCategorySchema>;

export const ServiceIconSchema = z.enum([
  "plane",
  "train",
  "bus",
  "temple",
  "passport",
  "idCard",
  "medical",
  "printer",
  "bill",
  "briefcase",
  "resume",
  "graduation",
  "compass",
  "globe",
]);
export type ServiceIcon = z.infer<typeof ServiceIconSchema>;

export const ServiceSchema = z
  .object({
    id: ServiceIdSchema,
    category: ServiceCategorySchema,
    icon: ServiceIconSchema,
    /** True when we only help customers apply; approval rests with the authority. */
    assistanceOnly: z.boolean(),
    /** Shown as a hero/home shortcut. */
    featured: z.boolean(),
  })
  .strict();
export type Service = z.infer<typeof ServiceSchema>;

const catalogue = [
  {
    id: "flights",
    category: "travel",
    icon: "plane",
    assistanceOnly: false,
    featured: true,
  },
  {
    id: "trains",
    category: "travel",
    icon: "train",
    assistanceOnly: false,
    featured: true,
  },
  { id: "buses", category: "travel", icon: "bus", assistanceOnly: false, featured: true },
  {
    id: "darshanam",
    category: "travel",
    icon: "temple",
    assistanceOnly: true,
    featured: true,
  },
  {
    id: "passport",
    category: "digital",
    icon: "passport",
    assistanceOnly: true,
    featured: false,
  },
  {
    id: "pan",
    category: "digital",
    icon: "idCard",
    assistanceOnly: true,
    featured: false,
  },
  {
    id: "gccMedicalPcc",
    category: "digital",
    icon: "medical",
    assistanceOnly: true,
    featured: false,
  },
  {
    id: "xeroxPrinting",
    category: "digital",
    icon: "printer",
    assistanceOnly: false,
    featured: false,
  },
  {
    id: "billPayments",
    category: "digital",
    icon: "bill",
    assistanceOnly: true,
    featured: false,
  },
  {
    id: "jobApplications",
    category: "digital",
    icon: "briefcase",
    assistanceOnly: true,
    featured: false,
  },
  {
    id: "resume",
    category: "digital",
    icon: "resume",
    assistanceOnly: false,
    featured: false,
  },
  {
    id: "eamcet",
    category: "digital",
    icon: "graduation",
    assistanceOnly: true,
    featured: false,
  },
  {
    id: "counselling",
    category: "digital",
    icon: "compass",
    assistanceOnly: true,
    featured: false,
  },
  {
    id: "onlineServices",
    category: "digital",
    icon: "globe",
    assistanceOnly: true,
    featured: false,
  },
] satisfies Service[];

export const services: readonly Service[] = Object.freeze(
  z.array(ServiceSchema).parse(catalogue),
);

export const servicesByCategory = (category: ServiceCategory) =>
  services.filter((service) => service.category === category);

export const featuredServices = () => services.filter((service) => service.featured);

import type { HeroSceneName } from "@/components/home/HeroScenes";
import type { ServiceId } from "./services";

/**
 * Photography slots. Each slot renders its art-directed plate until a
 * licensed, owner-approved `image` is added here (see docs/ASSETS.md).
 * Never point a slot at stock imagery of a specific place we do not serve.
 */
export type Plate = "dusk" | "dawn" | "gold" | "stone";

export type MediaSlot = {
  plate: Plate;
  /** Art-directed vector scene shown over the plate until `image` exists. */
  scene?: HeroSceneName;
  image?: { src: string; alt: { en: string; te: string } };
};

export const serviceMedia: Partial<Record<ServiceId, MediaSlot>> = {
  flights: { plate: "dusk", scene: "flights" },
  trains: { plate: "dawn", scene: "rail" },
  buses: { plate: "stone", scene: "road" },
  darshanam: { plate: "gold", scene: "darshanam" },
};

/** The "Digital & Government Services" category card. */
export const digitalCategoryMedia: MediaSlot = { plate: "stone" };

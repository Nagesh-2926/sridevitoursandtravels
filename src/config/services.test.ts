import { describe, expect, it } from "vitest";
import { en } from "@/i18n/dictionaries/en";
import { te } from "@/i18n/dictionaries/te";
import { featuredServices, serviceIds, services, servicesByCategory } from "./services";

describe("service catalogue", () => {
  it("lists the 4 travel and 10 digital services confirmed by the owner", () => {
    expect(servicesByCategory("travel")).toHaveLength(4);
    expect(servicesByCategory("digital")).toHaveLength(10);
    expect(services.map((s) => s.id)).toEqual([...serviceIds]);
  });

  it("has unique ids", () => {
    expect(new Set(services.map((s) => s.id)).size).toBe(services.length);
  });

  it("never carries price, availability or confirmation data", () => {
    const forbidden = /price|fare|cost|amount|availab|confirm|seat/i;
    for (const service of services) {
      for (const key of Object.keys(service)) expect(key).not.toMatch(forbidden);
    }
  });

  it("marks government-related services as assistance only", () => {
    for (const id of [
      "passport",
      "pan",
      "gccMedicalPcc",
      "eamcet",
      "counselling",
    ] as const) {
      expect(services.find((s) => s.id === id)?.assistanceOnly).toBe(true);
    }
  });

  it("features the four travel services in the hero", () => {
    expect(featuredServices().map((s) => s.id)).toEqual([
      "flights",
      "trains",
      "buses",
      "darshanam",
    ]);
  });

  it.each([
    ["en", en],
    ["te", te],
  ])("has %s copy for every service", (_, dict) => {
    for (const id of serviceIds) {
      expect(dict.services.items[id].title.trim()).not.toBe("");
      expect(dict.services.items[id].summary.trim()).not.toBe("");
    }
  });
});

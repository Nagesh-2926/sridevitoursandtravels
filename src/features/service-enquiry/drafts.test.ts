import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  readServiceDraft,
  pruneExpiredServiceDrafts,
  removeServiceDraft,
  SERVICE_DRAFT_TTL_MS,
  writeServiceDraft,
} from "./drafts";

const passportKey = "sridevi:service-enquiry-draft:v1:passport";
const panKey = "sridevi:service-enquiry-draft:v1:pan";

beforeEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("service enquiry drafts", () => {
  it("isolates drafts by service and removes only the requested service", () => {
    expect(
      writeServiceDraft("passport", {
        values: { name: "Ravi" },
        lastActivityAt: 100,
      }).ok,
    ).toBe(true);
    expect(
      writeServiceDraft("pan", {
        values: { name: "Sita" },
        lastActivityAt: 100,
      }).ok,
    ).toBe(true);

    expect(removeServiceDraft("passport").ok).toBe(true);
    expect(window.localStorage.getItem(passportKey)).toBeNull();
    expect(readServiceDraft("pan", 101)).toEqual({
      ok: true,
      value: { values: { name: "Sita" }, lastActivityAt: 100 },
    });
  });

  it("expires drafts after 24 hours of inactivity", () => {
    window.localStorage.setItem(
      passportKey,
      JSON.stringify({
        values: { name: "Ravi" },
        lastActivityAt: 10,
      }),
    );

    const active = readServiceDraft("passport", 10 + SERVICE_DRAFT_TTL_MS - 1);
    expect(active.ok && active.value).toEqual({
      values: { name: "Ravi" },
      lastActivityAt: 10,
    });

    expect(readServiceDraft("passport", 10 + SERVICE_DRAFT_TTL_MS)).toEqual({
      ok: true,
      value: null,
    });
    expect(window.localStorage.getItem(passportKey)).toBeNull();
  });

  it("prunes expired drafts for all services without touching active drafts", () => {
    window.localStorage.setItem(
      passportKey,
      JSON.stringify({
        values: { name: "Ravi" },
        lastActivityAt: 10,
      }),
    );
    window.localStorage.setItem(
      panKey,
      JSON.stringify({
        values: { name: "Sita" },
        lastActivityAt: 12,
      }),
    );

    expect(pruneExpiredServiceDrafts(10 + SERVICE_DRAFT_TTL_MS + 1).ok).toBe(true);
    expect(window.localStorage.getItem(passportKey)).toBeNull();
    expect(window.localStorage.getItem(panKey)).not.toBeNull();
  });

  it("removes malformed and future-dated draft records", () => {
    window.localStorage.setItem(passportKey, "{bad json");
    expect(readServiceDraft("passport", 100)).toEqual({ ok: true, value: null });
    expect(window.localStorage.getItem(passportKey)).toBeNull();

    window.localStorage.setItem(
      panKey,
      JSON.stringify({ values: { name: "Sita" }, lastActivityAt: 101 }),
    );
    expect(readServiceDraft("pan", 100)).toEqual({ ok: true, value: null });
    expect(window.localStorage.getItem(panKey)).toBeNull();
  });

  it("reports storage access errors instead of claiming the draft was saved", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("Blocked", "SecurityError");
    });
    expect(
      writeServiceDraft("passport", {
        values: { name: "Ravi" },
        lastActivityAt: 100,
      }),
    ).toEqual({ ok: false });
  });
});

import { serviceIds, type ServiceId } from "@/config/services";

export const SERVICE_DRAFT_TTL_MS = 24 * 60 * 60 * 1000;
const STORAGE_PREFIX = "sridevi:service-enquiry-draft:v1:";

export type DraftServiceId = ServiceId | "general";

export type ServiceDraft = {
  values: Record<string, string>;
  lastActivityAt: number;
};

export type DraftStorageResult<T> = { ok: true; value: T } | { ok: false };

function storageKey(serviceId: DraftServiceId) {
  return `${STORAGE_PREFIX}${serviceId}`;
}

function parseDraft(raw: string): ServiceDraft | null {
  const parsed: unknown = JSON.parse(raw);
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed) ||
    !("values" in parsed) ||
    !("lastActivityAt" in parsed) ||
    typeof parsed.values !== "object" ||
    parsed.values === null ||
    Array.isArray(parsed.values) ||
    typeof parsed.lastActivityAt !== "number" ||
    !Number.isFinite(parsed.lastActivityAt)
  ) {
    return null;
  }

  const values = parsed.values as Record<string, unknown>;
  if (!Object.values(values).every((value) => typeof value === "string")) {
    return null;
  }

  return {
    values: values as Record<string, string>,
    lastActivityAt: parsed.lastActivityAt,
  };
}

export function readServiceDraft(
  serviceId: DraftServiceId,
  now = Date.now(),
): DraftStorageResult<ServiceDraft | null> {
  try {
    const key = storageKey(serviceId);
    const raw = window.localStorage.getItem(key);
    if (raw === null) return { ok: true, value: null };

    let draft: ServiceDraft | null;
    try {
      draft = parseDraft(raw);
    } catch {
      draft = null;
    }

    if (
      !draft ||
      draft.lastActivityAt > now ||
      now - draft.lastActivityAt >= SERVICE_DRAFT_TTL_MS
    ) {
      window.localStorage.removeItem(key);
      return { ok: true, value: null };
    }
    return { ok: true, value: draft };
  } catch {
    return { ok: false };
  }
}

export function writeServiceDraft(
  serviceId: DraftServiceId,
  draft: ServiceDraft,
): DraftStorageResult<undefined> {
  try {
    window.localStorage.setItem(storageKey(serviceId), JSON.stringify(draft));
    return { ok: true, value: undefined };
  } catch {
    return { ok: false };
  }
}

export function removeServiceDraft(
  serviceId: DraftServiceId,
): DraftStorageResult<undefined> {
  try {
    window.localStorage.removeItem(storageKey(serviceId));
    return { ok: true, value: undefined };
  } catch {
    return { ok: false };
  }
}

export function pruneExpiredServiceDrafts(
  now = Date.now(),
): DraftStorageResult<undefined> {
  for (const serviceId of [...serviceIds, "general" as const]) {
    const result = readServiceDraft(serviceId, now);
    if (!result.ok) return { ok: false };
  }
  return { ok: true, value: undefined };
}

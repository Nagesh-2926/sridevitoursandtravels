"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  readServiceDraft,
  pruneExpiredServiceDrafts,
  removeServiceDraft,
  writeServiceDraft,
  type DraftServiceId,
} from "./drafts";

const SAVE_DELAY_MS = 350;

export type DraftSaveState =
  "loading" | "empty" | "saving" | "saved" | "cleared" | "error";

export function useServiceDraft(
  serviceId: DraftServiceId,
  defaults: Record<string, string>,
  seedValues?: Record<string, string>,
) {
  const [values, setValues] = useState(defaults);
  const [ready, setReady] = useState(false);
  const [saveState, setSaveState] = useState<DraftSaveState>("loading");
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const [lastActivityAt, setLastActivityAt] = useState(0);
  const valuesRef = useRef(values);
  const lastActivityRef = useRef(0);
  const readyRef = useRef(false);
  const dirtyRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;

      const pruneResult = pruneExpiredServiceDrafts();
      const result = readServiceDraft(serviceId);
      if (!pruneResult.ok || !result.ok) {
        setSaveState("error");
      } else if (result.value) {
        const restored = { ...defaults, ...result.value.values };
        valuesRef.current = restored;
        lastActivityRef.current = result.value.lastActivityAt;
        setValues(restored);
        setLastActivityAt(result.value.lastActivityAt);
        setLastSavedAt(result.value.lastActivityAt);
        setSaveState("saved");
      } else if (
        seedValues &&
        Object.values(seedValues).some((value) => value.length > 0)
      ) {
        const seeded = { ...defaults, ...seedValues };
        const activityAt = Date.now();
        valuesRef.current = seeded;
        lastActivityRef.current = activityAt;
        dirtyRef.current = true;
        setValues(seeded);
        setLastActivityAt(activityAt);
        setSaveState("saving");
      } else {
        setSaveState("empty");
      }

      readyRef.current = true;
      setReady(true);
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [defaults, seedValues, serviceId]);

  useEffect(() => {
    if (!ready || saveState !== "saving") return;
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      const savedAt = Date.now();
      const result = writeServiceDraft(serviceId, {
        values,
        lastActivityAt,
      });
      if (result.ok) {
        dirtyRef.current = false;
        setLastSavedAt(savedAt);
        setSaveState("saved");
      } else {
        setSaveState("error");
      }
      timerRef.current = null;
    }, SAVE_DELAY_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [lastActivityAt, ready, saveState, serviceId, values]);

  const flush = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    if (!readyRef.current || !dirtyRef.current) return;

    const result = writeServiceDraft(serviceId, {
      values: valuesRef.current,
      lastActivityAt: lastActivityRef.current,
    });
    if (result.ok) dirtyRef.current = false;
  }, [serviceId]);

  useEffect(() => {
    window.addEventListener("pagehide", flush);
    return () => {
      window.removeEventListener("pagehide", flush);
      flush();
    };
  }, [flush]);

  const update = useCallback((name: string, value: string) => {
    const next = { ...valuesRef.current, [name]: value };
    const activityAt = Date.now();
    valuesRef.current = next;
    lastActivityRef.current = activityAt;
    dirtyRef.current = true;
    setValues(next);
    setLastActivityAt(activityAt);
    setSaveState("saving");
  }, []);

  const reset = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    const result = removeServiceDraft(serviceId);
    if (!result.ok) {
      setSaveState("error");
      return false;
    }

    dirtyRef.current = false;
    valuesRef.current = defaults;
    setValues(defaults);
    setLastActivityAt(0);
    setLastSavedAt(null);
    setSaveState("cleared");
    return true;
  }, [defaults, serviceId]);

  return { values, ready, saveState, lastSavedAt, update, reset };
}

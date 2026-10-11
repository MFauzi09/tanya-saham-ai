"use client";

import { useCallback, useMemo, useState, useSyncExternalStore } from "react";

export const STORAGE_KEYS = {
  sessions: "tsa:sessions",
  activeSession: "tsa:active",
  settings: "tsa:settings",
  user: "tsa:user",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
}

const listeners = new Set<() => void>();
const notify = () => listeners.forEach((listener) => listener());

function subscribe(listener: () => void) {
  listeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

const SERVER_SNAPSHOT = undefined;

export function useStoredState<T>(key: string, fallback: T) {
  const [stableFallback] = useState(fallback);
  const raw = useSyncExternalStore(
    subscribe,
    () => {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    () => SERVER_SNAPSHOT,
  );

  const value = useMemo<T>(() => {
    if (!raw) return stableFallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return stableFallback;
    }
  }, [raw, stableFallback]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const prev = readStorage(key, stableFallback);
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
      writeStorage(key, resolved);
      notify();
    },
    [key, stableFallback],
  );

  return [value, update, raw !== SERVER_SNAPSHOT] as const;
}

export const newId = () => crypto.randomUUID();

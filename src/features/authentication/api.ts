import { invoke } from "@tauri-apps/api/core";

// Thin, typed wrapper around the Rust commands in
// src-tauri/src/commands/mod.rs.

export interface NewProfile {
  username: string;
  password: string;
  /** ISO 4217, e.g. "COP" (§7.1) */
  baseCurrency: string;
  /** e.g. "es-CO" (§7.2) */
  locale: string;
  /** Minutes of inactivity before auto-lock; null = "Never" (§6.3) */
  autoLockMinutes: number | null;
}

/** Whether a local profile already exists (decides create vs. login screen). */
export function profileExists(): Promise<boolean> {
  return invoke("profile_exists");
}

/** Creates the single local profile. Fails if one already exists. */
export function createProfile(profile: NewProfile): Promise<void> {
  return invoke("create_profile", {
    profile: {
      username: profile.username,
      password: profile.password,
      base_currency: profile.baseCurrency,
      locale: profile.locale,
      auto_lock_minutes: profile.autoLockMinutes,
    },
  });
}

/** Attempts to log in / unlock with the given password. */
export function login(password: string): Promise<boolean> {
  return invoke("login", { password });
}
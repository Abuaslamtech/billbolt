import { Colors } from "./colors";

export const BIOMETRIC_KEY = "@billbolt_biometric_enabled";
export const APP_LOCK_PROMPT_SHOWN_KEY = "@billbolt_app_lock_prompt_shown";

export const PAYMENT_COLORS: Record<string, string> = {
  Cash: Colors.mint,
  Transfer: Colors.primary,
  Card: Colors.purple,
  Other: Colors.warning.text,
};

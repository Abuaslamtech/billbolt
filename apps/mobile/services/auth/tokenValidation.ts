/**
 * Hermes-safe JWT payload decoder.
 *
 * `atob` with raw JWTs is unreliable on Hermes (React Native's JS engine).
 * This avoids Buffer (unavailable in RN) and uses manual base64 decoding.
 * Ported from Scath — battle-tested in production.
 */

const PROACTIVE_BUFFER_MS = 5 * 60 * 1000; // refresh 5 minutes before expiry

export function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;

    const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (padded.length % 4)) % 4);
    const b64 = padded + padding;

    const binary = atob(b64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return null;
  }
}

/** Returns true ONLY when the token is actually expired. Used at boot time. */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000;
}

/**
 * Returns true when the token will expire within 5 minutes.
 * Used by the Axios interceptor so we refresh proactively before a 401.
 */
export function shouldProactivelyRefresh(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload?.exp) return true;
  return Date.now() >= payload.exp * 1000 - PROACTIVE_BUFFER_MS;
}

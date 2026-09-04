/**
 * Billbolt Design System — Color Constants
 * Single source of truth. Always import from here, never use raw hex strings.
 * Mirrors tailwind.config.js bolt-* tokens exactly.
 */
export const Colors = {
  // ── Brand ─────────────────────────────────────────────────────────
  primary:     "#0052CC",   // bolt-blue   — deep authority blue
  primaryDark: "#003A99",   // bolt-primary-dark
  primaryLight:"#E8F0FE",  // bolt-light

  // ── Neutrals ───────────────────────────────────────────────────────
  black:     "#000000",   // pure black for native shadows
  graphite:  "#1A1A1A",   // bolt-graphite — near-black
  slate:     "#6B7280",   // bolt-slate    — secondary text
  surface:   "#F9FAFB",   // bolt-surface  — page background
  card:      "#FFFFFF",   // bolt-card     — card background
  border:    "#E5E7EB",   // bolt-border
  divider:   "#F3F4F6",   // bolt-divider
  disabled:  "#D1D5DB",   // bolt-disabled

  // ── Semantic ───────────────────────────────────────────────────────
  success: { text: "#15803D", bg: "#F0FDF4", border: "#BBF7D0" },
  danger:  { text: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  warning: { text: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },

  // ── Accent ─────────────────────────────────────────────────────────
  yellow: "#FFD700",
  mint:   "#22C55E",
  purple: "#8B5CF6",
} as const;

export type ColorKey = keyof typeof Colors;

/**
 * Billbolt Shared Design Tokens & Tailwind Preset
 * Shared across mobile (NativeWind) and web apps (Admin, Landing).
 */

module.exports = {
  theme: {
    extend: {
      colors: {
        "bolt-blue": "#0052CC",
        "bolt-light": "#E8F0FE",
        "bolt-primary-dark": "#003A99",
        "bolt-yellow": "#F7B500",
        "bolt-mint": "#22C55E",
        "bolt-purple": "#8B5CF6",
        "bolt-red": "#EF4444",
        "bolt-graphite": "#1A1A1A",
        "bolt-slate": "#6B7280",
        "bolt-surface": "#F9FAFB",
        "bolt-card": "#FFFFFF",
        "bolt-border": "#E5E7EB",
        "bolt-divider": "#F3F4F6",
        "bolt-disabled": "#D1D5DB",
        "bolt-success-text": "#15803D",
        "bolt-success-bg": "#F0FDF4",
        "bolt-success-border": "#BBF7D0",
        "bolt-danger-text": "#DC2626",
        "bolt-danger-bg": "#FEF2F2",
        "bolt-danger-border": "#FECACA",
        "bolt-warning-text": "#D97706",
        "bolt-warning-bg": "#FFFBEB",
        "bolt-warning-border": "#FDE68A",
      },
      fontFamily: {
        poppins: ["Poppins", "system-ui", "-apple-system", "sans-serif"],
        inter: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "bolt-sm": "8px",
        "bolt": "12px",
        "bolt-lg": "16px",
        "2xl": "16px",
        "3xl": "24px",
      },
    },
  },
};

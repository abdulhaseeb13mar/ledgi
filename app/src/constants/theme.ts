export const colors = {
  primary: "#01017e",
  accent: "#5f59f7",
  accentLight: "#5f59f720",

  // Status colors
  red: {
    50: "#fef2f2",
    100: "#fee2e2",
    200: "#fecaca",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
  green: {
    50: "#f0fdf4",
    100: "#dcfce7",
    600: "#16a34a",
    700: "#15803d",
  },
  indigo: {
    50: "#eef2ff",
    200: "#c7d2fe",
    400: "#818cf8",
    600: "#4f46e5",
  },
  yellow: {
    100: "#fef9c3",
    700: "#a16207",
  },

  // Neutrals
  white: "#ffffff",
  black: "#000000",
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    900: "#111827",
  },

  // Overlay
  overlay: "rgba(0,0,0,0.4)",
  overlayLight: "rgba(255,255,255,0.5)",
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  "2xl": 24,
  "3xl": 32,
};

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  full: 9999,
};

export const fontSize = {
  xs: 11,
  sm: 12,
  base: 14,
  md: 15,
  lg: 16,
  xl: 18,
  "2xl": 20,
  "3xl": 24,
};

export const fontWeight = {
  normal: "400" as const,
  medium: "500" as const,
  semibold: "600" as const,
  bold: "700" as const,
};

// Shared Tailwind CDN theme for Aqari — loaded before the Tailwind CDN script on every page.
// Mirrors the Stitch DESIGN.md design system.
window.tailwind = window.tailwind || {};
tailwind.config = {
  theme: {
    extend: {
      colors: {
        primary: "#1A2B4A",            // deep navy
        "primary-dark": "#031634",
        "primary-soft": "#8293B7",
        accent: "#C8A96E",             // sand gold
        "accent-soft": "#FEDB9C",
        success: "#2E7D52",            // green
        whatsapp: "#25D366",           // WhatsApp green
        bg: "#FAFAFA",
        surface: "#FFFFFF",
        "border-subtle": "#E2E8F0",
        "text-main": "#0F172A",
        "text-muted": "#64748B",
        danger: "#BA1A1A",
      },
      fontFamily: {
        sans: ['"DM Sans"', "system-ui", "sans-serif"],
        arabic: ['"Tajawal"', '"Noto Sans Arabic"', "system-ui", "sans-serif"],
      },
      maxWidth: { container: "1200px" },
      boxShadow: {
        lift: "0 10px 25px -5px rgba(26, 43, 74, 0.12)",
        modal: "0 20px 40px -10px rgba(0, 0, 0, 0.15)",
      },
      borderRadius: { card: "0.5rem", panel: "1rem" },
    },
  },
};

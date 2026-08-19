/**
 * External Tailwind CDN config (kept out of index.html so script-src
 * does not need 'unsafe-inline').
 */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        navy: "#0A192F",
        icebg: "#E1F5FE",
        softgray: "#F5F7FA",
        bp: "#0288D1",
        sugar: "#4FC3F7",
        pulse: "#00BCD4",
        emergency: "#FF5252",
      },
      borderRadius: { card: "12px" },
    },
  },
};

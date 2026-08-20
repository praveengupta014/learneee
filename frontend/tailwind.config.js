/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#1B2340",       // primary text / headings
        indigo: "#2D3A66",    // primary actions
        sage: "#3F9C82",      // positive / growth accent
        amber: "#E8A33D",     // ratings, highlights
        paper: "#F5F6F2",     // page background
        slate: "#5B6478",     // secondary text
        line: "#E4E3DC",      // hairlines / borders
        coral: "#D9634C",     // sparingly, alerts / empty states
      },
      fontFamily: {
        display: ["Fraunces", "serif"],
        sans: ["Inter", "sans-serif"],
        mono: ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "10px",
      },
    },
  },
  plugins: [],
};

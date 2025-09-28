/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,ts}"],
  theme: {
    extend: {
      colors: {
        bg: "#0b1220",
        card: "#121a2b",
        text: "#e7edf7",
        muted: "#9fb3d8",
        accent: "#4da3ff",
        danger: "#ff5b6e",
        ok: "#35ca87",
        warn: "#ffcf66"
      }
    }
  },
  plugins: []
}

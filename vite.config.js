import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import glsl from "vite-plugin-glsl";

export default defineConfig({
  server: {
    port: 3001,  // Change this to the port you want to use
  },
  plugins: [react(), glsl()],
  root: "",
  base: "./",
});

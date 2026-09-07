import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Versión mostrada en el sidebar (ver __APP_VERSION__ en vite-env.d.ts)
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"));

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: process.env.PORT ? Number(process.env.PORT) : 5173,
    },
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version),
    },
});

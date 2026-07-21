import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig((env) => ({
	publicDir: env.command === "serve" ? "public" : undefined,
	build: {
		lib: {
			entry: "./lib/index.ts",
			formats: ["es", "cjs"],
			name: "levyUtils",
			fileName: "levyUtils",
		},
	},
	plugins: [dts()],
}));

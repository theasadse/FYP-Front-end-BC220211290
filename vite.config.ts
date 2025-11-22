import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

/**
 * Vite configuration file.
 *
 * This configuration sets up the build environment for the React application, including:
 * - Base URL configuration.
 * - React plugin integration.
 * - Build output directory and asset handling.
 * - Rollup options for chunking and file naming.
 * - Development server settings.
 *
 * @see {@link https://vitejs.dev/config/} for more details.
 */
export default defineConfig({
  /**
   * Base public path when served in development or production.
   * @type {string}
   */
  base: "/",

  /**
   * Array of plugins to use.
   * @type {Array}
   */
  plugins: [react()],

  /**
   * Build specific options.
   * @type {object}
   */
  build: {
    /**
     * Output directory for the build.
     * @type {string}
     */
    outDir: "dist",

    /**
     * Directory to nest generated assets under.
     * @type {string}
     */
    assetsDir: "assets",

    /**
     * Generate source maps. Disabled for production.
     * @type {boolean}
     */
    sourcemap: false,

    /**
     * Limit for chunk size warning (in kbs).
     * @type {number}
     */
    chunkSizeWarningLimit: 1000,

    /**
     * Custom Rollup options.
     * @type {object}
     */
    rollupOptions: {
      output: {
        /**
         * Manual chunking configuration to split vendor libraries.
         * @type {object}
         */
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "antd-core": ["antd"],
          "antd-icons": ["@ant-design/icons"],
          apollo: ["@apollo/client", "graphql"],
        },

        /**
         * File naming pattern for assets.
         * @type {string}
         */
        assetFileNames: "assets/[name]-[hash][extname]",

        /**
         * File naming pattern for chunks.
         * @type {string}
         */
        chunkFileNames: "assets/[name]-[hash].js",

        /**
         * File naming pattern for entry files.
         * @type {string}
         */
        entryFileNames: "assets/[name]-[hash].js",
      },
    },
  },

  /**
   * Server specific options.
   * @type {object}
   */
  server: {
    /**
     * Port to listen on.
     * @type {number}
     */
    port: 3000,

    /**
     * Listen on all local IPs.
     * @type {boolean}
     */
    host: true,
  },
});

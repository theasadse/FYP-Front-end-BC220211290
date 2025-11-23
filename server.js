/**
 * Express server for serving the production build of the React application.
 *
 * This server is responsible for:
 * 1. Serving static files from the 'dist' directory.
 * 2. Implementing caching strategies for static assets.
 * 3. Handling SPA (Single Page Application) routing by serving 'index.html' for non-asset routes.
 * 4. Basic error handling and logging.
 *
 * @module Server
 */

const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || 8080;

const distPath = path.join(__dirname, "dist");

/**
 * Serve static files from the distribution directory.
 * Configures caching for improved performance.
 *
 * @name StaticFileMiddleware
 * @function
 * @param {string} distPath - The path to the distribution directory.
 * @param {object} options - Options for serving static files.
 * @param {string} options.maxAge - Cache duration for general files.
 * @param {boolean} options.etag - Enable ETag generation.
 * @param {boolean} options.lastModified - Enable Last-Modified header.
 * @param {function} options.setHeaders - Custom function to set headers based on file path.
 */
app.use(
  express.static(distPath, {
    maxAge: "1h",
    etag: true,
    lastModified: true,
    setHeaders: (res, filepath) => {
      // Don't cache HTML files - always get fresh version
      if (filepath.endsWith(".html")) {
        res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
        res.setHeader("Pragma", "no-cache");
      }
      // Cache static assets (with hash in filename) for longer
      else if (filepath.includes("/assets/")) {
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
      // Default caching for other files
      else {
        res.setHeader("Cache-Control", "public, max-age=3600");
      }
    },
  })
);

/**
 * Route handler for the favicon.
 * Tries to serve the favicon from the dist directory.
 * If not found, returns 204 No Content to avoid 404 errors.
 *
 * @name FaviconHandler
 * @function
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 */
app.get("/favicon.ico", (req, res) => {
  const faviconPath = path.join(distPath, "vite.svg");
  res.sendFile(faviconPath, (err) => {
    if (err) {
      // If no favicon exists, send 204 No Content instead of 404
      res.status(204).end();
    }
  });
});

/**
 * SPA fallback middleware.
 * Serves index.html for all non-asset routes to support client-side routing.
 * Skips processing for files with extensions (assumed to be assets).
 *
 * @name SPAFallbackMiddleware
 * @function
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
app.use((req, res, next) => {
  // Skip for files with extensions (assets)
  if (path.extname(req.path).length > 0) {
    return next();
  }

  // Serve index.html for all other routes
  res.sendFile(path.join(distPath, "index.html"), (err) => {
    if (err) {
      console.error("Error serving index.html:", err);
      res.status(500).send("Application error");
    }
  });
});

/**
 * Global error handling middleware.
 * Logs the error and sends a 500 status code.
 *
 * @name ErrorHandlerMiddleware
 * @function
 * @param {Error} err - The error object.
 * @param {express.Request} req - The request object.
 * @param {express.Response} res - The response object.
 * @param {express.NextFunction} next - The next middleware function.
 */
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).send("Internal server error");
});

/**
 * Starts the Express server.
 * Listens on the specified port and logs the running status.
 *
 * @name StartServer
 * @function
 */
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server running on port ${port}`);
  console.log(`📁 Serving from: ${distPath}`);
  console.log(`🌐 Visit: http://localhost:${port}`);
});

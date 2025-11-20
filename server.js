const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 8080

const distPath = path.join(__dirname, 'dist')

// Serve static files from dist directory with caching
app.use(express.static(distPath, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, filepath) => {
    // Cache static assets for longer
    if (filepath.includes('/assets/')) {
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
    }
  }
}))

// Handle favicon specifically to avoid 404
app.get('/favicon.ico', (req, res) => {
  const faviconPath = path.join(distPath, 'vite.svg')
  res.sendFile(faviconPath, (err) => {
    if (err) {
      // If no favicon exists, send 204 No Content instead of 404
      res.status(204).end()
    }
  })
})

// SPA fallback: serve index.html for all non-asset routes
app.use((req, res, next) => {
  // Skip for files with extensions (assets)
  if (path.extname(req.path).length > 0) {
    return next()
  }
  
  // Serve index.html for all other routes
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      console.error('Error serving index.html:', err)
      res.status(500).send('Application error')
    }
  })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err)
  res.status(500).send('Internal server error')
})

app.listen(port, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${port}`)
  console.log(`📁 Serving from: ${distPath}`)
  console.log(`🌐 Visit: http://localhost:${port}`)
})

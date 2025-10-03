const express = require('express')
const path = require('path')
const app = express()
const port = process.env.PORT || 8080

const distPath = path.join(__dirname, 'dist')
app.use(express.static(distPath))

// SPA fallback middleware: serve index.html for non-file GET requests
app.use((req, res, next) => {
  if (req.method !== 'GET') return next()
  // let static files pass through (requests for assets, containing a dot)
  if (path.extname(req.path)) return next()
  res.sendFile(path.join(distPath, 'index.html'))
})

app.listen(port, () => {
  console.log(`Serving dist at http://localhost:${port}`)
})

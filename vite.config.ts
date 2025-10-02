import { defineConfig } from 'vite'

// Use async config and dynamic import so ESM-only plugins load correctly in
// environments where require() would fail to load ESM modules.
export default defineConfig(async () => {
  const react = (await import('@vitejs/plugin-react')).default
  return {
    plugins: [react()]
  }
})

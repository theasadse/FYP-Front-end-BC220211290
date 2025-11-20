# Digital Ocean Deployment Guide

## Quick Start

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Digital Ocean Account

## Deployment Steps

### Option 1: Using Digital Ocean App Platform (Recommended)

1. **Connect Your Repository**

   - Go to Digital Ocean App Platform
   - Click "Create App"
   - Connect your GitHub repository
   - Select the branch: `main`

2. **Configure Build Settings**

   - Build Command: `npm run build`
   - Run Command: `npm start`
   - HTTP Port: `8080`

3. **Environment Variables** (if needed)

   - Add your environment variables in the App Platform dashboard
   - Example:
     ```
     NODE_ENV=production
     VITE_API_URL=https://your-api-endpoint.com
     ```

4. **Deploy**
   - Click "Deploy"
   - Wait for the build to complete

### Option 2: Manual Deployment

```bash
# 1. Build the application
npm run build

# 2. Start the server
npm start
```

## Configuration Files

### `.do/app.yaml`

Digital Ocean App Platform configuration file with all necessary settings.

### `server.js`

Express server that:

- Serves static files from `dist/`
- Handles SPA routing
- Manages favicon requests
- Binds to `0.0.0.0` for proper cloud deployment

### `vite.config.ts`

Vite build configuration with:

- Production optimizations
- Code splitting
- Asset management

## Troubleshooting

### Issue: 404 errors for assets

**Solution:**

- Ensure `base: '/'` in vite.config.ts
- Clear browser cache
- Rebuild the application

### Issue: Blank page after deployment

**Solution:**

- Check browser console for errors
- Verify API endpoints are correct
- Check CORS settings on your backend

### Issue: Favicon not found

**Solution:**

- The server now handles missing favicon gracefully
- Default favicon is in `/public/vite.svg`
- Customize by replacing this file

## Production Checklist

- ✅ Build completes without errors
- ✅ Environment variables are set
- ✅ API endpoints are configured
- ✅ Static files are served correctly
- ✅ SPA routing works (all routes load)
- ✅ No console errors in production
- ✅ Assets load from CDN/correct paths

## Performance Tips

1. **Enable compression** (already configured in server.js)
2. **Use CDN** for static assets if needed
3. **Monitor bundle size** - Current config splits vendor code
4. **Enable caching** - Static files cached for 1 year

## Support

For issues or questions:

1. Check the browser console for errors
2. Review server logs in Digital Ocean dashboard
3. Verify all build steps completed successfully

## Local Testing

Test production build locally:

```bash
npm run build
npm start
# Visit http://localhost:8080
```

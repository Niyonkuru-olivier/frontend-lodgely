# Lodgely Frontend - Vercel Deployment Guide

## Prerequisites
- GitHub account with frontend code pushed
- Vercel account
- Backend deployed and running (get the URL from Render)

## Deployment Steps

### 1. Import Project to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your frontend GitHub repository

### 2. Configure Project Settings
- **Framework Preset**: Next.js (auto-detected)
- **Root Directory**: Leave as `.` (since frontend is at root of its repo)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `.next` (default)
- **Install Command**: `npm install` (default)

### 3. Add Environment Variable
⚠️ **CRITICAL**: Add this environment variable before deploying

| Key | Value |
|-----|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-backend-url.onrender.com` |

**Example**: `https://lodgely-backend.onrender.com` (use your actual Render backend URL)

### 4. Deploy
- Click "Deploy"
- Wait for deployment (usually 2-3 minutes)
- Once deployed, you'll get a URL like: `https://lodgely-frontend.vercel.app`

### 5. Test the Application
1. Visit your Vercel URL
2. You should see the accommodation listings
3. Try registering/logging in
4. Test search and filters

## Troubleshooting

### API calls fail / No accommodations show
- Check that `NEXT_PUBLIC_API_URL` is set correctly in Vercel
- Verify backend is running on Render
- Check browser console for CORS errors

### Build fails
- Check that all dependencies are in package.json
- Verify Node.js version compatibility

## Notes
- Vercel automatically redeploys on every push to main branch
- Preview deployments created for pull requests
- Custom domain can be added in Vercel project settings

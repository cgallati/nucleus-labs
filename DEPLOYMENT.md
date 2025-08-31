# Production Deployment Guide

This guide will help you deploy Nucleus Labs to production using Vercel + MongoDB Atlas + Vercel Blob Storage.

## Prerequisites

- ✅ MongoDB Atlas cluster already set up
- ✅ Vercel account
- ✅ GitHub repository

## Step 1: MongoDB Atlas Setup

Since you already have MongoDB Atlas running, ensure you have:

1. **Database User** with read/write permissions
2. **Network Access** configured (allow access from anywhere: `0.0.0.0/0` for Vercel)
3. **Connection String** ready

### Get Your Connection String:
1. Go to MongoDB Atlas Dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (should look like):
   ```
   mongodb+srv://username:password@cluster.mongodb.net/nucleus-labs?retryWrites=true&w=majority
   ```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Vercel will auto-detect Next.js settings

### Option B: Deploy via CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow the prompts
```

## Step 3: Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

### Required Environment Variables:

| Variable | Value | Notes |
|----------|--------|-------|
| `DATABASE_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
| `PAYLOAD_SECRET` | `your-long-random-secret` | Generate a secure random string |
| `NEXT_PUBLIC_SERVER_URL` | `https://your-domain.vercel.app` | Your Vercel deployment URL |
| `CRON_SECRET` | `another-random-secret` | For authenticated cron jobs |
| `PREVIEW_SECRET` | `preview-secret` | For draft preview functionality |

### Automatic Variables (Vercel provides):
- `BLOB_READ_WRITE_TOKEN` - Automatically provided when you enable Blob Storage
- `NODE_ENV=production` - Set by Vercel

## Step 4: Enable Vercel Blob Storage

1. In your Vercel project dashboard:
   - Go to "Storage" tab
   - Click "Create Database"
   - Select "Blob"
   - Follow the setup process

2. Vercel will automatically add `BLOB_READ_WRITE_TOKEN` to your environment variables

## Step 5: Initial Deployment & Database Setup

1. **First deployment** will automatically trigger
2. **Create admin user**:
   - Visit `https://your-domain.vercel.app/admin`
   - Create your first admin user
3. **Test file upload**:
   - Visit `https://your-domain.vercel.app/upload-test`
   - Upload a 3D file to verify Blob storage works

## Step 6: Domain Setup (Optional)

1. In Vercel dashboard → Settings → Domains
2. Add your custom domain
3. Update `NEXT_PUBLIC_SERVER_URL` to your custom domain

## Environment Configuration Summary

### Development (Local):
- **Storage**: Local files in `/print-files`
- **Database**: Local MongoDB or Atlas
- **Files**: Stored locally, gitignored

### Production (Vercel):
- **Storage**: Vercel Blob Storage (automatic)
- **Database**: MongoDB Atlas
- **Files**: Stored in cloud, served via CDN

## Troubleshooting

### Common Issues:

1. **"Database connection failed"**
   - Check your `DATABASE_URI` is correct
   - Verify MongoDB Atlas network access allows Vercel IPs

2. **"File uploads failing"**
   - Ensure Blob Storage is enabled in Vercel
   - Check `BLOB_READ_WRITE_TOKEN` is present

3. **"Build errors"**
   - Run `pnpm build` locally first to test
   - Check all dependencies are in `dependencies` not `devDependencies`

### Useful Commands:

```bash
# Test production build locally
pnpm build && pnpm start

# Check environment variables
vercel env ls

# View deployment logs
vercel logs

# Force redeploy
vercel --prod
```

## Security Checklist

- ✅ `PAYLOAD_SECRET` is long and random
- ✅ MongoDB Atlas has network restrictions
- ✅ Admin panel is only accessible to authenticated users
- ✅ File uploads have security scanning
- ✅ Environment variables are secure

## Post-Deployment

1. **Test all functionality**:
   - File uploads
   - Admin panel access
   - 3D file analysis
   - Security scanning

2. **Monitor performance**:
   - Check Vercel Analytics
   - Monitor MongoDB Atlas metrics
   - Watch for any errors in Vercel logs

3. **Set up monitoring** (optional):
   - Vercel provides built-in monitoring
   - Consider setting up alerts for errors

Your Nucleus Labs 3D printing service is now live! 🚀
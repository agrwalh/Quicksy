# 🚀 Deployment Guide for Blinkit Project

This guide will help you deploy your Blinkit project to make it live on the internet.

## 📋 Prerequisites

1. **GitHub Account** - Your code should be on GitHub
2. **MongoDB Atlas Account** - For cloud database
3. **Railway Account** (Recommended) or Render Account

## 🗄️ Step 1: Set up MongoDB Atlas (Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create a free account
3. Create a new cluster (free tier)
4. Create a database user with password
5. Get your connection string
6. Replace `your_mongodb_connection_string_here` in your `.env` file

## 🚂 Step 2: Deploy to Railway (Recommended)

### Option A: Deploy via Railway Dashboard

1. **Sign up/Login to Railway**
   - Go to [railway.app](https://railway.app)
   - Sign up with your GitHub account

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your GitHub account
   - Select your blinkit repository

3. **Configure Environment Variables**
   - Go to your project settings
   - Add the following environment variables:
   ```
   MONGOURL=your_mongodb_atlas_connection_string
   SESSION_SECRET=your_random_session_secret
   GOOGLE_CLIENT_ID=your_google_oauth_client_id
   GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
   RAZORPAY_KEY_ID=your_razorpay_key_id
   RAZORPAY_KEY_SECRET=your_razorpay_secret_key
   JWT_SECRET=your_jwt_secret
   ```

4. **Deploy**
   - Railway will automatically detect your Node.js app
   - It will install dependencies and start your server
   - Your app will be live at a URL like: `https://your-app-name.railway.app`

### Option B: Deploy via Railway CLI

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Deploy**
   ```bash
   railway login
   railway init
   railway up
   ```

## 🌐 Step 3: Alternative - Deploy to Render

1. Go to [render.com](https://render.com)
2. Sign up with GitHub
3. Click "New Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Name**: blinkit-app
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
6. Add environment variables in the dashboard
7. Deploy

## 🔧 Step 4: Configure Google OAuth (Optional)

If you're using Google OAuth:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add your deployed URL to authorized redirect URIs
6. Update your environment variables

## 🔧 Step 5: Configure Razorpay (Optional)

If you're using Razorpay payments:

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Get your API keys
3. Update environment variables

## 🌍 Step 6: Custom Domain (Optional)

### Railway
1. Go to your Railway project
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Configure DNS records

### Render
1. Go to your Render service
2. Click "Settings" → "Custom Domains"
3. Add your domain
4. Configure DNS

## ✅ Step 7: Verify Deployment

1. Visit your deployed URL
2. Test all major features:
   - User registration/login
   - Product browsing
   - Cart functionality
   - Payment flow (if implemented)
   - Admin panel

## 🔍 Troubleshooting

### Common Issues:

1. **Environment Variables Not Set**
   - Double-check all variables are set in deployment platform
   - Ensure no typos in variable names

2. **Database Connection Issues**
   - Verify MongoDB Atlas connection string
   - Check if IP whitelist includes deployment platform

3. **Static Files Not Loading**
   - Ensure `public` folder is properly served
   - Check file paths in your EJS templates

4. **Port Issues**
   - The app now uses `process.env.PORT` which is automatically set by deployment platforms

## 📞 Support

If you encounter issues:
1. Check deployment platform logs
2. Verify all environment variables are set
3. Test locally with the same environment variables

## 🎉 Congratulations!

Your Blinkit project is now live! Share your URL with the world.

---

**Quick Deploy Checklist:**
- [ ] MongoDB Atlas set up
- [ ] Environment variables configured
- [ ] GitHub repository ready
- [ ] Railway/Render account created
- [ ] Deployment successful
- [ ] All features tested
- [ ] Custom domain configured (optional) 
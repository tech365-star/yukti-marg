# Yukti Marg - Deployment Guide for Vercel

This repository contains the complete full-stack application (Vite + React + Tailwind CSS + Express backend).

## Quick Deploy to Vercel

1. **Push to GitHub**:
   - Create a GitHub repository and push all files from this project.

2. **Import into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **Add New...** > **Project** and select your repository.

3. **Configure Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

4. **Environment Variables**:
   Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key.
   - `NODE_ENV`: `production`

5. **Deploy**:
   Click **Deploy**. Vercel will build the frontend into `dist/` and route API calls through `/api/index.ts`.

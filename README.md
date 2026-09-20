# Yukti Marg - Firebase Hosting Deployment Guide

This guide explains how to host and deploy the **Yukti Marg** web application to **Google Firebase Hosting**.

---

## Prerequisites

1. Install Node.js (v18 or v20+ recommended).
2. Install the Firebase CLI globally:
   ```bash
   npm install -g firebase-tools
   ```

---

## Step-by-Step Deployment to Firebase Hosting

### 1. Log in to Firebase
Run the following in your terminal:
```bash
firebase login
```
This will open your browser to log into your Google Account.

### 2. Connect Your Project
If you haven't already linked your Firebase project, run:
```bash
firebase use --add
```
Select your existing Firebase project (or create one at [console.firebase.google.com](https://console.firebase.google.com)).

Alternatively, replace `"your-firebase-project-id"` in `.firebaserc` with your real Firebase Project ID.

### 3. Build the Production Bundle
Compile the Vite frontend assets into the `dist/` folder:
```bash
npm run build
```

### 4. Deploy to Firebase Hosting
Run:
```bash
firebase deploy --only hosting
```

Once the deployment completes, Firebase will provide your live hosting URL:
```text
✔ Hosting URL: https://<your-project-id>.web.app
```

---

## Configuration Overview

- **`firebase.json`**:
  - Points `"public"` to the production build folder (`dist`).
  - Configures SPA client-side routing so all paths fallback to `/index.html`.
- **`.firebaserc`**:
  - Links your local repository to your target Firebase Project ID.

# FitTrack-Pro

A world-class, production-ready fitness tracking platform built with **React Native (Expo)** and **Node.js**.

## Features
- **Real-time GPS Tracking**: Live maps and route drawing using `react-native-maps` and `expo-location`.
- **Social Feed & Community**: Share workouts, posts, create groups, and join challenges.
- **Robust Backend**: Node.js, Express, MongoDB Atlas, and Socket.IO for live tracking.
- **Secure Authentication**: JWT and bcrypt based auth system.

## Project Structure (Monorepo)
- `/backend`: The Node.js Express REST API and Socket.IO server.
- `/mobile`: The Expo React Native application.

## Prerequisites
- Node.js (v20+)
- MongoDB (Local or Atlas)
- Expo CLI (`npm install -g expo-cli`)

## Quick Start

1. **Install dependencies for all workspaces:**
   ```bash
   npm install
   ```
2. **Configure Environment Variables:**
   - Navigate to `/backend` and update `.env` with your MongoDB URI, JWT Secrets, and Cloudinary keys.

3. **Start Development Servers (Backend & Mobile):**
   ```bash
   npm run dev
   ```
   This uses `concurrently` to start the Node.js backend (port 5000) and the Expo bundler simultaneously.

## Deployment

### Backend
Can be deployed to Render, Railway, or Heroku. Ensure environment variables are set in the cloud provider.

### Mobile App (Standalone APK)
We use EAS (Expo Application Services) to generate production-ready `.apk` and `.aab` files.
```bash
cd mobile
npm run build:apk
```

### Web App (Vercel)
The mobile app gracefully degrades (e.g., Maps) for web support. To deploy to Vercel:
```bash
cd mobile
npm run deploy:vercel
```

## Contributing
See individual READMEs in `/backend` and `/mobile` for specific module development instructions.

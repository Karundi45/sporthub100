# FitTrack-Pro Deployment Guide

This guide outlines how to deploy the FitTrack-Pro platform to production environments, ensuring scalable performance, security, and real-time connectivity.

## 1. Backend Deployment (Render / Railway / Heroku)

The Node.js backend handles the REST API, Socket.IO real-time tracking, and MongoDB connections.

### Environment Variables Required in Production:
- `NODE_ENV`: `production`
- `MONGO_URI`: Your MongoDB Atlas connection string.
- `JWT_SECRET`: A secure, random 256-bit string.
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`: Credentials from Cloudinary.

### Steps for Render:
1. Connect your GitHub repository to Render.
2. Create a new **Web Service**.
3. **Root Directory**: `backend`
4. **Build Command**: `npm install && npm run build`
5. **Start Command**: `npm start`
6. Add the environment variables listed above.

## 2. Database (MongoDB Atlas)

1. Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Go to **Database Access** and create a user with read/write privileges.
3. Go to **Network Access** and whitelist `0.0.0.0/0` (or specifically the IPs of your backend hosting provider).
4. Copy the Connection String and insert it into your Backend's `MONGO_URI` environment variable.

## 3. Mobile Deployment (EAS - Expo Application Services)

The mobile application is built using React Native and Expo. You will compile it into an `.aab` for Android and `.ipa` for iOS.

### Prerequisites:
- Expo account (`npx expo login`)
- Apple Developer Account (for iOS App Store)
- Google Play Console Account (for Android Play Store)

### Configuration Updates:
Before building, ensure the `API_URL` in `mobile/src/services/api.ts` and `SOCKET_URL` in `mobile/src/services/socket.ts` are updated to point to your deployed backend URL (e.g., `https://api.fittrack-pro.com`), rather than localhost.

### Building the Apps:
1. Install EAS CLI: `npm install -g eas-cli`
2. Initialize EAS in the `mobile` directory: `eas build:configure`
3. Build for Android: 
   ```bash
   eas build -p android --profile production
   ```
4. Build for iOS:
   ```bash
   eas build -p ios --profile production
   ```

## 4. Docker Deployment (Alternative)

If you prefer deploying to an AWS EC2 instance or DigitalOcean Droplet, you can use the provided Docker configuration.

1. SSH into your server.
2. Clone the repository.
3. Run `docker-compose up -d --build`.
4. Ensure a reverse proxy (like NGINX) is configured to handle SSL termination and route traffic to port `5000`.

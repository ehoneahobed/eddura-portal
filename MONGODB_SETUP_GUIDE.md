# MongoDB Setup Guide - Fix for Application Templates 500 Error

## Root Cause
The application templates page is failing with a 500 error because the `MONGODB_URI` environment variable is not properly configured. The error "Failed to fetch application templates" occurs when the server cannot connect to the MongoDB database.

## Quick Fix

### Option 1: MongoDB Atlas (Recommended - Free & Easy)

1. **Create a MongoDB Atlas Account**
   - Go to [https://www.mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Sign up for a free account
   - Create a new cluster (free tier is sufficient)

2. **Get Your Connection String**
   - In Atlas dashboard, click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (should look like: `mongodb+srv://...`)

3. **Update Environment File**
   - Open `.env.local` in your project root
   - Replace the `MONGODB_URI` value with your actual connection string:
   ```
   MONGODB_URI=mongodb+srv://your_username:your_password@your_cluster.mongodb.net/eddura_dev?retryWrites=true&w=majority
   ```

4. **Seed the Database**
   ```bash
   npm run seed
   ```

5. **Start the Application**
   ```bash
   npm run dev
   ```

### Option 2: Local MongoDB

1. **Install MongoDB**
   - Follow instructions at [https://www.mongodb.com/docs/manual/installation/](https://www.mongodb.com/docs/manual/installation/)
   - Start MongoDB service

2. **Update Environment File**
   ```
   MONGODB_URI=mongodb://localhost:27017/eddura_dev
   ```

3. **Seed and Start**
   ```bash
   npm run seed
   npm run dev
   ```

## Verification

After setting up MongoDB, you can verify the fix by:

1. Starting the development server: `npm run dev`
2. Navigate to the application templates page
3. The 500 error should be resolved and data should load

## Technical Details

The error occurs in `/app/api/application-templates/route.ts` when:
- `connectDB()` fails due to missing/invalid `MONGODB_URI`
- The catch block returns a 500 status with "Failed to fetch application templates"
- SWR retries the failed request multiple times, causing repeated errors

## Additional Configuration

The `.env.local` file also contains other important settings:
- `NEXTAUTH_SECRET`: Already configured with a secure random value
- `NEXT_PUBLIC_LAUNCHED`: Set to `true` to show the full application
- `NEXTAUTH_URL`: Set to your application URL

## Need Help?

If you continue experiencing issues:
1. Check the server logs for detailed error messages
2. Verify your MongoDB connection string is correct
3. Ensure your MongoDB cluster/instance is running
4. Check firewall settings if using local MongoDB
import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || process.env.MONGODB_URI;

    if (!uri) {
      console.warn('⚠️  WARNING: MONGO_URI or MONGODB_URI environment variable is not defined.');
      console.warn('⚠️  The server will start, but database operations will fail.');
      return;
    }
    const conn = await mongoose.connect(uri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    // Do not exit the process in production so Render deployment succeeds.
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  }
};

export default connectDB;

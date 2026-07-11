import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 3000;

const connectDB = async (retryCount = 0) => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/cricauction', {
      serverSelectionTimeoutMS: 5000,
      heartbeatFrequencyMS: 10000,
    });
    console.log(`  ✓ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      console.warn(`  ⏳ MongoDB retry ${retryCount + 1}/${MAX_RETRIES}: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
      return connectDB(retryCount + 1);
    }
    console.error(`  ✗ MongoDB connection failed after ${MAX_RETRIES} retries: ${error.message}`);
    process.exit(1);
  }
};

// Monitor connection health after initial connect
mongoose.connection.on('disconnected', () => {
  console.warn('  ⚠ MongoDB disconnected');
});

mongoose.connection.on('error', (err) => {
  console.error(`  ✗ MongoDB error: ${err.message}`);
});

export default connectDB;

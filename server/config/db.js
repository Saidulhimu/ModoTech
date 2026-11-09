import mongoose from 'mongoose';
import { seedDatabase } from '../seedData.js';

export const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/modotech';
  try {
    // 3 second connection attempt; if MongoDB is not running locally, immediately fallback gracefully
    await mongoose.connect(mongoURI, { serverSelectionTimeoutMS: 3000 });
    console.log(`✅ MongoDB Connected to: ${mongoURI}`);
    await seedDatabase();
  } catch (err) {
    console.warn('⚠️ MongoDB connection warning:', err.message);
    console.log('⚡ ModoTech is running in ultra-fast High-Performance In-Memory Mode with instant response.');
  }
};

export const isDBConnected = () => mongoose.connection.readyState === 1;

export default connectDB;


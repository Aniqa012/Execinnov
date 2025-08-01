import mongoose from "mongoose";

declare global {
  var mongoose: {
    conn: typeof import("mongoose") | null;
    promise: Promise<typeof import("mongoose")> | null;
  };
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  const MONGODB_URI = process.env.MONGODB_URI;

  if (!MONGODB_URI) {
    console.error("❌ MONGODB_URI environment variable is not defined");
    throw new Error(
      "Please define the MONGODB_URI environment variable in your environment variables",
    );
  }

  if (cached.conn) {
    console.log("🔄 Using existing MongoDB connection");
    return cached.conn;
  }
  
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      dbName: "execinnoc",
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };
    
    console.log("🔌 Attempting to connect to MongoDB...");
    
    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      console.log("✅ MongoDB connected successfully");
      
      // Set up connection event handlers for monitoring
      mongoose.connection.on('error', (error) => {
        console.error('❌ MongoDB connection error:', error);
      });
      
      mongoose.connection.on('disconnected', () => {
        console.warn('⚠️ MongoDB disconnected');
        // Reset cache when disconnected so next request reconnects
        cached.conn = null;
        cached.promise = null;
      });
      
      mongoose.connection.on('reconnected', () => {
        console.log('🔄 MongoDB reconnected');
      });
      
      return mongoose;
    }).catch((error) => {
      console.error('💥 MongoDB connection failed:', error);
      cached.promise = null;
      throw error;
    });
  }
  
  try {
    cached.conn = await cached.promise;
  } catch (e) {
    console.error('💥 Failed to connect to MongoDB:', e);
    cached.promise = null;
    throw new Error(`Database connection failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }

  return cached.conn;
}

export default dbConnect;
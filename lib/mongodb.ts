import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

let cached = (global as any).mongoose;
if (!cached) cached = (global as any).mongoose = { conn: null, promise: null };

export async function connectMongo() {
  // If no DB link yet, throw a clear error (so your UI can show message)
  if (!MONGODB_URI) {
    throw new Error("MONGODB_URI is missing. Add it in .env.local");
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, { dbName: "workzup" });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

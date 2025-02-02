import mongoose, { Mongoose } from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

interface MongooseConn {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
}

let cached: MongooseConn = (global as any).mongoose
if(!cached){
    cached = (global as any).mongoose = {
        conn: null,
        promise: null
    }
}

export const connectToDatabase = async () => {
  if (cached.conn) return cached.conn;

  if(!MONGODB_URI) throw new Error('MONGODB_URI is missing');

  cached.promise = cached.promise || mongoose.connect(MONGODB_URI, {
    dbName: 'evently',
    bufferCommands: false,
  })

  cached.conn = await cached.promise;

  return cached.conn;
}

// this is a way of connecting mongodb to next, this is
// basically there are server actions and each server action
// is calling connctToDatabase again and again and if we weren't
// caching it, then it will make a new connections to database 
// but by caching our connection then all the subsequent invocations 
// can reuse the existing connection if it is open 
// if not, then it will create one.

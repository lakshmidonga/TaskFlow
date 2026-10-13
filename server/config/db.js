import mongoose from 'mongoose';

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskflow';
  try {
    const conn = await mongoose.connect(uri);
    console.log(`[TaskFlow DB] MongoDB Connected: ${conn.connection.host}/${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[TaskFlow DB] Connection Error: ${error.message}`);
    console.error(`[TaskFlow DB] Please make sure MongoDB is running or check MONGODB_URI in .env`);
    // Do not crash the entire process immediately so error can be reported via health API
    return null;
  }
};

import mongoose from "mongoose";

// Connection tuned for high concurrency:
// - maxPoolSize raised so a single Node process can hold many concurrent
//   sockets to MongoDB instead of queuing requests behind a small pool.
// - In a real 1M-concurrent-user deployment, this API would run as many
//   stateless replicas behind a load balancer (see README "Scaling to 1M
//   concurrent users"), each with its own pool, talking to a MongoDB
//   replica set (or sharded cluster) rather than a single instance.
export const connectDB = async () => {
  try {
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,
      minPoolSize: 5,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (err) {
    console.error(`MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};

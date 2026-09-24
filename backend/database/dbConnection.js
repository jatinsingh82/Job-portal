import mongoose from "mongoose";

const dbConnection = () => {
  mongoose.set("bufferCommands", false);
  const dbUrl = process.env.DB_URL || process.env.MONGODB_URI;
  if (!dbUrl) {
    console.warn("[Job Portal] DB_URL not configured. Running with in-memory database store.");
    return;
  }

  mongoose
    .connect(dbUrl, {
      dbName: "Job_Portal",
    })
    .then(() => {
      console.log("MongoDB Connected Successfully");
    })
    .catch((error) => {
      console.warn(`[Job Portal] MongoDB connection failed (${error.message}). Active in-memory fallback store.`);
    });
};

export default dbConnection;

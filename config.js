  // // server/config.js
  // import mongoose from "mongoose";
  // import dotenv from "dotenv";

  // dotenv.config();
  // let isConnected = false;


  // // const connectDB = async () => {
  // //   try {
  // //     await mongoose.connect(process.env.MONGO_URI, {
  // //       useNewUrlParser: true,
  // //       useUnifiedTopology: true,
  // //     });
  // //     console.log("MongoDB connected");
  // //   } catch (error) {
  // //     console.error("MongoDB connection failed", error);
  // //     process.exit(1);
  // //   }
  // // };


  // async function connectToMongoDB(){
  //   try{
  //     await mongoose.connect(process.env.MONGO_URI, {
  //       useNewUrlParser: true,
  //       useUnifiedTopology: true,
  //     });
  //     isConnected = true;
  //     console.log("MongoDB connected");
  //   } catch (error) {
  //     console.error("MongoDB connection failed", error);
  //     process.exit(1);
  //   }
  // }

  // export default connectDB;


// server/config.js
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

/**
 * Connect to MongoDB if not already connected.
 * For serverless environments we check mongoose.connection.readyState:
 * 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export async function connectToMongoDB() {
  try {
    if (mongoose.connection.readyState === 1) {
      // already connected
      return;
    }
    await mongoose.connect(process.env.MONGO_URI, {
      // options are optional for modern mongoose
    });
    console.log("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection failed:", error);
    // In serverless functions we shouldn't call process.exit; instead rethrow so the caller/logs can show error.
    throw error;
  }
}









// // server/config.js
// import mongoose from "mongoose";
// import dotenv from "dotenv";
// dotenv.config();

// export async function connectToMongoDB() {
//   const mongoUri = process.env.MONGO_URI;
//   if (!mongoUri) {
//     console.warn("MONGO_URI not set — skipping MongoDB connection (OK for local-only routes).");
//     return null;
//   }

//   // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
//   if (mongoose.connection.readyState === 1) {
//     return mongoose.connection;
//   }

//   // Connect; allow errors to bubble so caller can log them
//   await mongoose.connect(mongoUri, {});
//   console.log("MongoDB connected (readyState:", mongoose.connection.readyState, ")");
//   return mongoose.connection;
// }

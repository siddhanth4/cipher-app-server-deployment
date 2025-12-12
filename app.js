// // // server/app.js
// // import express from "express";
// // import bodyParser from "body-parser";
// // import cors from "cors";
// // import connectDB from "./config.js";
// // import messageRoutes from "./routes/messages.js";
// // import dotenv from "dotenv";

// // dotenv.config();

// // const app = express();
// // // const PORT = process.env.PORT || 5000;

// // // Connect to MongoDB
// // connectDB();

// // // Middleware
// // app.use(cors());
// // app.use(bodyParser.json());

// // app.use((req, res, next) => {
// //   if(!isConnected){
// //     connectToMongoDB();
// //   }
// //   next();
// // })


// // // Routes
// // app.use("/api/messages", messageRoutes);

// // // Start server
// // // app.listen(PORT, () => {
// // //   console.log(`Server is running on port ${PORT}`);
// // // });

// // module.exports = app;







// // server/app.js
// import express from "express";
// import bodyParser from "body-parser";
// import cors from "cors";
// import { connectToMongoDB } from "./config.js";
// import messageRoutes from "./routes/messages.js";
// import dotenv from "dotenv";

// dotenv.config();

// const app = express();

// // Middlewares
// app.use(cors());
// app.use(bodyParser.json());

// // connect to DB once (serverless will call file per cold start; repeated attempts will be no-ops)
// connectToMongoDB().catch(err => {
//   // DO NOT process.exit in serverless; log the error. Vercel logs will show this.
//   console.error("Initial MongoDB connection failed (continuing):", err.message || err);
// });

// // Routes
// app.use("/api/messages", messageRoutes);

// // Health check root route
// app.get("/", (req, res) => {
//   res.json({ status: "ok" });
// });

// // Export the Express app as the default export — Vercel's @vercel/node can handle this.
// export default app;



// server/app.js
import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/messages.js";
import { connectToMongoDB } from "./config.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

/* Attempt DB connection but do not exit process on failure */
connectToMongoDB().catch((err) => {
  console.error("Initial MongoDB connection failed (continuing):", err.message || err);
});

app.get("/", (req, res) => res.json({ status: "ok" }));
app.use("/api/messages", messageRoutes);

/* Export app as default for Vercel */
export default app;

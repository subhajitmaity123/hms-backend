import app from "./app.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
  cloud_name: "dwwqreyvc",
  api_key: 784399665318681,
  api_secret: "JPGsXtX4CMl1-uX8xmrm1E6p-6A",
});

app.listen(4000, () => {
  console.log(`Server listening at port ${4000}`);
});



// import app from "./app.js";
// import mongoose from "mongoose";
// import cloudinary from "cloudinary";
// import multer from "multer";
// import fs from "fs";
// import dotenv from "dotenv";

// dotenv.config(); // Load environment variables from .env

// // Connect to MongoDB
// mongoose
//   .connect(process.env.MONGO_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   })
//   .then(() => console.log("✅ Database connected successfully"))
//   .catch((error) => console.log("❌ Database connection failed:", error));

// // Cloudinary Configuration
// cloudinary.v2.config({
//   cloud_name: "dwwqreyvc",
//   api_key: 784399665318681,
//   api_secret: "JPGsXtX4CMl1-uX8xmrm1E6p-6A",
// });



// // Start the Server
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`🚀 Server running on port ${PORT}`);
// });

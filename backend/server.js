import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/connectDB.js";
import houseHoldRoutes from "./routes/houseHoldRoutes.js";
import billRoutes from "./routes/billsRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import dotenv from "dotenv";
dotenv.config();
// Connect to database
connectDB();

const app = express();
const PORT = 5000;
// Get __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("api working!");
});

app.use("/api/house-hold", houseHoldRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import houseHoldRoutes from "./routes/houseHoldRoutes.js";
import billRoutes from "./routes/billsRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import transactionRoutes from "./routes/transactionRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import dotenv from "dotenv";
dotenv.config();
//aa
// Connect to database
connectDB();

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("api working!");
});

app.use("/api/house-hold", houseHoldRoutes);
app.use("/api/bills", billRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/auth", authRoutes);

// Start the server

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from "express";
import cors from "cors";
import connectDB from "./config/connectDB.js";
import houseHoldRoutes from "./routes/houseHoldRoute.js";
import dotenv from "dotenv";
dotenv.config();

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

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

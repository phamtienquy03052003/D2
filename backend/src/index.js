import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";

// Load env
dotenv.config();

// Kết nối csdl
connectDB();

const app = express();

// Security
app.use(helmet()); // bảo vệ header HTTP
app.use(cors({ origin: "*", credentials: true })); // CORS
app.use(express.json());
app.use(morgan("dev")); // log requests

// Rate limiting
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || "10");
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "5");
const limiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW * 60 * 1000,
  max: RATE_LIMIT_MAX,
  message: {
    success: false,
    message: `Quá nhiều yêu cầu. Vui lòng thử lại sau ${RATE_LIMIT_WINDOW} phút.`,
  },
});
app.use("/api", limiter);

// Routes
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

app.use("/api/auth", authRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error Handler:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi server nội bộ",
  });
});

// Server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`🚀 Server running securely on port ${PORT}`);
});

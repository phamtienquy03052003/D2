import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";

// Load env
dotenv.config();

// Kết nối csdl
connectDB();

const app = express();
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

// Security
app.use(helmet()); // bảo vệ header HTTP
app.use(cors({ origin: "*", credentials: true })); // CORS
app.use(express.json());
app.use(morgan("dev")); // log requests

// Routes
app.get("/", (req, res) => {
  res.send("Backend API is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error Handler:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi server nội bộ",
  });
});

// Socket.IO connection
io.on("connection", (socket) => {
  console.log("🔌 User connected:", socket.id);

  socket.on("joinPost", (postId) => {
    socket.join(postId);
    console.log(`${socket.id} joined post ${postId}`);
  });

  socket.on("joinUser", (userId) => {
    socket.join(userId);
    console.log(`${socket.id} joined user room ${userId}`);
  });

  socket.on("disconnect", () => console.log("Disconnected:", socket.id));
});

// Server
const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server running on port ${PORT}`));

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { createServer } from "http";
import { Server } from "socket.io";
import path from "path";
import connectDB from "./config/db.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import postRoutes from "./routes/postRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import commentRoutes from "./routes/commentRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import searchRoutes from "./routes/searchRoutes.js";
import pointRoutes from "./routes/pointRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import modMailRoutes from "./routes/modMailRoutes.js";

import modMailSocket from "./socket/modMailSocket.js";

dotenv.config();
connectDB();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});
app.set("io", io);

// Bảo mật & cấu hình cơ bản
app.use(helmet());
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(morgan("dev"));

// Cấu hình truy cập thư mục chứa ảnh upload
app.use(
  "/uploads",
  express.static(path.join(process.cwd(), "src/assets/uploads"), {
    setHeaders: (res, path, stat) => {
      res.set("Cross-Origin-Resource-Policy", "cross-origin");
    },
  })
);

// Routes
app.get("/", (req, res) => {
  res.send("Backend API đang chạy...");
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/communities", communityRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/points", pointRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api", modMailRoutes);

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error("Error Handler:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Lỗi máy chủ nội bộ",
  });
});

modMailSocket(io);

// Socket.IO
io.on("connection", (socket) => {
  console.log("Người dùng kết nối:", socket.id);

  socket.on("joinPost", (postId) => {
    socket.join(postId);
  });

  socket.on("joinUser", (userId) => {
    socket.join(userId);
  });

  socket.on("disconnect", () => console.log("Ngắt kết nối:", socket.id));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => console.log(`Server đang chạy trên cổng ${PORT}`));

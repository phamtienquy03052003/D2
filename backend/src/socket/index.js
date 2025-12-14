import { Server } from "socket.io";
import modMailSocket from "./modMailSocket.js";
import userHandler from "./handlers/userHandler.js";
import chatHandler from "./handlers/chatHandler.js";
import { authSocketMiddleware } from "./middleware/authSocketMiddleware.js";

let io;

export const initSocket = (httpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: [
                "http://localhost:5173",
                "http://localhost:3000",
                process.env.FRONTEND_URL,
                "https://damdao.vercel.app"
            ],
            methods: ["GET", "POST"],
            credentials: true,
        },
    });

    io.use(authSocketMiddleware);

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);


        socket.on("joinPost", (postId) => {
            socket.join(postId);

        });

        socket.on("leavePost", (postId) => {
            socket.leave(postId);

        });

        socket.on("joinUser", (userId) => {
            socket.join(userId);
            console.log(`Socket ${socket.id} joined user ${userId}`);
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });


        userHandler(io, socket);
        chatHandler(io, socket);
    });


    modMailSocket(io);

    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

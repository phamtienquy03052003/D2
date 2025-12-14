const onlineUsers = new Map(); 

export default function userHandler(io, socket) {
    socket.on("user_connected", (userId) => {
        if (!userId) return;

        onlineUsers.set(userId, socket.id);
        socket.userId = userId; 

        io.emit("user_online", userId);
        io.emit("get_online_users", Array.from(onlineUsers.keys()));

        console.log(`User ${userId} is online`);
    });

    socket.on("disconnect", () => {
        if (socket.userId) {
            onlineUsers.delete(socket.userId);
            io.emit("user_offline", socket.userId);
            io.emit("get_online_users", Array.from(onlineUsers.keys()));
            console.log(`User ${socket.userId} is offline`);
        }
    });

    socket.on("check_online", () => {
        socket.emit("get_online_users", Array.from(onlineUsers.keys()));
    });
}

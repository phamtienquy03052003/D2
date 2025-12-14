export default function chatHandler(io, socket) {
    socket.on("typing", ({ conversationId, userId, isTyping }) => {
        
        
        
        
        

        socket.to(`conversation_${conversationId}`).emit("typing", {
            conversationId,
            userId,
            isTyping
        });
    });

    socket.on("join_conversation", (conversationId) => {
        socket.join(`conversation_${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
    });

    socket.on("leave_conversation", (conversationId) => {
        socket.leave(`conversation_${conversationId}`);
    });
}

export default function modMailSocket(io) {
  io.on("connection", (socket) => {
    
    const user = socket.user;
    if (!user) return;

    
    socket.on("join_mod_rooms", ({ communityId }) => {
      socket.join(`community_${communityId}_mods`);
    });

    
    socket.on("join_conv", ({ conversationId }) => {
      socket.join(`modconv_${conversationId}`);
    });

    
    socket.on("leave_conv", ({ conversationId }) => {
      socket.leave(`modconv_${conversationId}`);
    });
  });
}

export default function modMailSocket(io) {
  io.on("connection", (socket) => {
    // attach user info from auth
    const user = socket.user;
    if (!user) return;

    // JOIN MOD ROOM
    socket.on("join_mod_rooms", ({ communityId }) => {
      socket.join(`community_${communityId}_mods`);
    });

    // JOIN CONVERSATION ROOM
    socket.on("join_conv", ({ conversationId }) => {
      socket.join(`modconv_${conversationId}`);
    });

    // LEAVE
    socket.on("leave_conv", ({ conversationId }) => {
      socket.leave(`modconv_${conversationId}`);
    });
  });
}

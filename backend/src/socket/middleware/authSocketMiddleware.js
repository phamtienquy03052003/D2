import jwt from "jsonwebtoken";

export const authSocketMiddleware = (socket, next) => {
    const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

    if (!token) {
        
        return next();
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        socket.user = { id: decoded.id || decoded._id || decoded.userId };
        next();
    } catch (err) {
        
        next(new Error("Authentication error: Invalid token"));
    }
};

import { getIO } from "../socket/index.js";

class SocketService {

    /**
     * Bắn sự kiện có bài viết mới tới room (Toàn cục hoặc Community)
     * @param {string} room - Room ID (hoặc 'global')
     * @param {object} post - Dữ liệu bài viết mới
     */
    static emitNewPost(room, post) {
        getIO().to(room).emit("newPost", post);
    }

    /**
     * Bắn sự kiện cập nhật bài viết (cho những người đang xem bài viết đó)
     * @param {string} postId - ID bài viết
     * @param {object} postData - Dữ liệu cập nhật
     */
    static emitUpdatePost(postId, postData) {
        getIO().to(postId.toString()).emit("updatePost", postData);
    }

    /**
     * Bắn sự kiện cập nhật Vote (Like/Dislike) bài viết
     * @param {string} postId - ID bài viết
     * @param {object} voteData - Dữ liệu vote mới
     */
    static emitUpdatePostVote(postId, voteData) {
        getIO().to(postId.toString()).emit("updatePostVote", voteData);
    }


    /**
     * Bắn sự kiện có comment mới
     * @param {string} postId - ID bài viết chứa comment
     * @param {object} comment - Dữ liệu comment mới
     */
    static emitNewComment(postId, comment) {
        getIO().to(postId.toString()).emit("newComment", comment);
    }

    /**
     * Bắn sự kiện cập nhật comment (Edit)
     * @param {string} postId - ID bài viết
     * @param {object} commentData - Dữ liệu comment đã sửa
     */
    static emitUpdateComment(postId, commentData) {
        getIO().to(postId.toString()).emit("updateComment", commentData);
    }

    /**
     * Bắn sự kiện xóa comment
     * @param {string} postId - ID bài viết
     * @param {string} commentId - ID comment bị xóa
     */
    static emitDeleteComment(postId, commentId) {
        getIO().to(postId.toString()).emit("deleteComment", commentId);
    }

    /**
     * Bắn sự kiện cập nhật reaction của comment
     * @param {string} postId - ID bài viết
     * @param {object} reactionData - Dữ liệu reaction mới
     */
    static emitUpdateReaction(postId, reactionData) {
        getIO().to(postId.toString()).emit("updateReaction", reactionData);
    }


    /**
     * Bắn thông báo (Notification) tới userId cụ thể
     * @param {string} userId - ID người nhận
     * @param {object} notification - Dữ liệu thông báo
     */
    static emitNewNotification(userId, notification) {
        getIO().to(userId.toString()).emit("newNotification", notification);
    }


    /**
     * Bắn sự kiện điểm thưởng được cộng
     * @param {string} userId - ID người nhận điểm
     * @param {object} pointData - Thông tin điểm cộng
     */
    static emitPointAdded(userId, pointData) {
        getIO().to(userId.toString()).emit("pointAdded", pointData);
    }


    /**
     * Bắn tin nhắn mới (Chat/Inbox)
     * @param {string} userId - ID người nhận
     * @param {object} message - Nội dung tin nhắn
     */
    static emitNewMessage(userId, message) {
        getIO().to(userId.toString()).emit("new_message", message);
    }

    /**
     * Bắn sự kiện cập nhật tin nhắn (Đã xem, reaction...)
     * @param {string} userId - ID người nhận
     * @param {object} message - Dữ liệu tin nhắn cập nhật
     */
    static emitMessageUpdate(userId, message) {
        getIO().to(userId.toString()).emit("message_update", message);
    }
}

export default SocketService;

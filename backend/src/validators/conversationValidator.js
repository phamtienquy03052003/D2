import { body, param, validationResult } from "express-validator";

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: errors.array()[0].msg,
            errors: errors.array()
        });
    }
    next();
};

export const validateCreatePrivateConversation = [
    body("userIds")
        .isArray({ min: 2, max: 2 })
        .withMessage("Danh sách người dùng phải chứa chính xác 2 ID")
        .custom((value) => {
            if (!value.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
                throw new Error("ID người dùng không hợp lệ");
            }
            return true;
        }),
    validate,
];

export const validateCreateGroupConversation = [
    body("name")
        .trim()
        .notEmpty()
        .withMessage("Tên nhóm không được để trống")
        .isLength({ min: 3, max: 50 })
        .withMessage("Tên nhóm phải từ 3 đến 50 ký tự"),
    body("members")
        .isArray({ min: 2 })
        .withMessage("Nhóm phải có ít nhất 2 thành viên")
        .custom((value) => {
            if (!value.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
                throw new Error("ID thành viên không hợp lệ");
            }
            return true;
        }),
    body("createdBy")
        .isMongoId()
        .withMessage("ID người tạo không hợp lệ"),
    validate,
];

export const validateUpdateGroupMembers = [
    param("conversationId")
        .isMongoId()
        .withMessage("ID cuộc trò chuyện không hợp lệ"),
    body("addMembers")
        .optional()
        .isArray()
        .withMessage("Danh sách thêm thành viên phải là mảng")
        .custom((value) => {
            if (!value.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
                throw new Error("ID thành viên thêm vào không hợp lệ");
            }
            return true;
        }),
    body("removeMembers")
        .optional()
        .isArray()
        .withMessage("Danh sách xóa thành viên phải là mảng")
        .custom((value) => {
            if (!value.every((id) => /^[0-9a-fA-F]{24}$/.test(id))) {
                throw new Error("ID thành viên xóa đi không hợp lệ");
            }
            return true;
        }),
    validate,
];

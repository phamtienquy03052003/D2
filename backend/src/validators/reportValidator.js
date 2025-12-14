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

export const validateCreateReport = [
    body("targetType")
        .isIn(["Community", "Post", "Comment"])
        .withMessage("Loại báo cáo không hợp lệ (Community, Post, Comment)"),
    body("targetId")
        .isMongoId()
        .withMessage("ID mục tiêu không hợp lệ"),
    body("reason")
        .trim()
        .notEmpty()
        .withMessage("Vui lòng chọn lý do báo cáo"),
    body("description")
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage("Mô tả chi tiết không được vượt quá 500 ký tự"),
    validate,
];

export const validateUpdateReportStatus = [
    param("reportId")
        .isMongoId()
        .withMessage("ID báo cáo không hợp lệ"),
    body("status")
        .isIn(["Pending", "Viewed", "Resolved", "Rejected"])
        .withMessage("Trạng thái không hợp lệ"),
    validate,
];

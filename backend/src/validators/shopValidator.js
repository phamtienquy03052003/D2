import { body, validationResult } from "express-validator";

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

export const validateBuyXP = [
    body("packageId")
        .notEmpty()
        .withMessage("Vui lòng chọn gói XP")
        .isIn(["small", "medium", "large", "xlarge"])
        .withMessage("Gói XP không hợp lệ"),
    validate,
];

export const validateBuyNameTag = [
    body("itemId")
        .notEmpty()
        .withMessage("Vui lòng chọn thẻ tên")
        .matches(/^nametag_[a-z]+$/)
        .withMessage("ID thẻ tên không hợp lệ"),
    validate,
];

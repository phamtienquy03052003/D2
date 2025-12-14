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

export const updateProfileValidator = [
    body("name").optional().trim().notEmpty().withMessage("Name cannot be empty"),
    body("bio").optional().trim().isLength({ max: 500 }).withMessage("Bio must be less than 500 characters"),
    validate,
];

export const updatePasswordValidator = [
    body("oldPassword").notEmpty().withMessage("Current password is required"),
    body("newPassword")
        .isLength({ min: 6 })
        .withMessage("New password must be at least 6 characters long"),
    validate,
];

export const updatePhoneValidator = [
    body("phone")
        .trim()
        .matches(/^[0-9]{10,11}$/)
        .withMessage("Invalid phone number format"),
    validate,
];

export const updateGenderValidator = [
    body("gender").isIn(["Nam", "Nữ", "Khác"]).withMessage("Invalid gender"),
    validate,
];



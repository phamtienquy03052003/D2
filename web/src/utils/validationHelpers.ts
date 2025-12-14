import { toast } from "react-hot-toast";

export const validateRequired = (value: string, fieldName: string): boolean => {
    if (!value || value.trim().length === 0) {
        toast.error(`${fieldName} không được để trống`);
        return false;
    }
    return true;
};

export const validateMinLength = (value: string, min: number, fieldName: string): boolean => {
    if (value.trim().length < min) {
        toast.error(`${fieldName} phải có ít nhất ${min} ký tự`);
        return false;
    }
    return true;
};

export const validateMaxLength = (value: string, max: number, fieldName: string): boolean => {
    if (value.trim().length > max) {
        toast.error(`${fieldName} không được vượt quá ${max} ký tự`);
        return false;
    }
    return true;
};

export const validateEmail = (email: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!re.test(email)) {
        toast.error("Email không hợp lệ");
        return false;
    }
    return true;
};

export const validateMongoId = (id: string): boolean => {
    const re = /^[0-9a-fA-F]{24}$/;
    return re.test(id);
};

export const validateImageFile = (file: File): boolean => {
    const validTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (!validTypes.includes(file.type)) {
        toast.error("Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WEBP)");
        return false;
    }

    const maxSize = 5 * 1024 * 1024; 
    if (file.size > maxSize) {
        toast.error("Kích thước ảnh không được vượt quá 5MB");
        return false;
    }

    return true;
};

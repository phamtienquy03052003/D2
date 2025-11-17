import multer from "multer";
import path from "path";
import fs from "fs";

// Thư mục lưu avatar
const avatarDir = path.join(process.cwd(), "src/assets/uploads/avatars");
const communityAvatarDir = path.join(process.cwd(), "src/assets/uploads/communityAvatars");

// Tạo thư mục nếu chưa tồn tại
[avatarDir, communityAvatarDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Storage động
const createStorage = (uploadDir, prefix) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const id = req.user?.id || req.body.communityId || "guest";
      cb(null, `${prefix}-${id}-${Date.now()}${ext}`);
    },
  });

// Filter file ảnh
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Chỉ cho phép upload file ảnh (jpg, jpeg, png)"));
};

// Giới hạn 5MB
const limits = { fileSize: 5 * 1024 * 1024 };

// Export middleware riêng biệt
export const uploadUserAvatar = multer({ storage: createStorage(avatarDir, "user"), fileFilter, limits });
export const uploadCommunityAvatar = multer({ storage: createStorage(communityAvatarDir, "community"), fileFilter, limits });

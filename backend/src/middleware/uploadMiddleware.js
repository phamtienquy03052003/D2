import multer from "multer";
import path from "path";
import fs from "fs";

// --- Cấu hình thư mục lưu trữ ---
const avatarDir = path.join(process.cwd(), "src/assets/uploads/avatars");
const communityAvatarDir = path.join(process.cwd(), "src/assets/uploads/communityAvatars");
const postImagesDir = path.join(process.cwd(), "src/assets/uploads/posts");
const postVideosDir = path.join(process.cwd(), "src/assets/uploads/videos");
const commentImagesDir = path.join(process.cwd(), "src/assets/uploads/comments");

// Tạo thư mục nếu chưa tồn tại
[avatarDir, communityAvatarDir, postImagesDir, postVideosDir, commentImagesDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/**
 * Helper tạo storage engine cho Multer
 * @param {string} uploadDir - Thư mục đích
 * @param {string} prefix - Tiền tố tên file
 */
const createStorage = (uploadDir, prefix) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const id = req.user?.id || req.body.communityId || "guest";
      cb(null, `${prefix}-${id}-${Date.now()}${ext}`);
    },
  });

// Bộ lọc file ảnh
const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Chỉ cho phép upload file ảnh (jpg, jpeg, png)"));
};

const limits = { fileSize: 5 * 1024 * 1024 }; // Giới hạn 5MB cho ảnh

// --- Upload Avatar (User & Community) ---
export const uploadUserAvatar = multer({ storage: createStorage(avatarDir, "user"), fileFilter, limits });
export const uploadCommunityAvatar = multer({ storage: createStorage(communityAvatarDir, "community"), fileFilter, limits });

// --- Upload Post Images ---
export const uploadPostImages = multer({ storage: createStorage(postImagesDir, "post"), fileFilter, limits });

// Bộ lọc file video
const videoFilter = (req, file, cb) => {
  const allowed = /mp4|webm|ogg/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Chỉ cho phép upload video (mp4, webm, ogg)"));
};

const videoLimits = { fileSize: 50 * 1024 * 1024 }; // Giới hạn 50MB cho video

// --- Upload Post Video ---
export const uploadPostVideo = multer({
  storage: createStorage(postVideosDir, "video"),
  fileFilter: videoFilter,
  limits: videoLimits
});

// --- Upload Post Media (Mixed: Images + 1 Video) ---
const postMediaUploader = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'video') {
        cb(null, postVideosDir);
      } else {
        cb(null, postImagesDir);
      }
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const id = req.user?.id || "guest";
      const prefix = file.fieldname === 'video' ? 'video' : 'post';
      cb(null, `${prefix}-${id}-${Date.now()}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (file.fieldname === 'video') {
      videoFilter(req, file, cb);
    } else {
      fileFilter(req, file, cb);
    }
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // Max size chung (lấy theo video)
});

export const uploadPostMedia = postMediaUploader.fields([
  { name: 'images', maxCount: 4 },
  { name: 'video', maxCount: 1 }
]);

// --- Upload Comment Image ---
export const uploadCommentImage = multer({
  storage: createStorage(commentImagesDir, "comment"),
  fileFilter,
  limits
}).single('image');

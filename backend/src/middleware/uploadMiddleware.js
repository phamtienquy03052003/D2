import multer from "multer";
import path from "path";
import fs from "fs";


const avatarDir = path.join(process.cwd(), "src/assets/uploads/avatars");
const communityAvatarDir = path.join(process.cwd(), "src/assets/uploads/communityAvatars");


[avatarDir, communityAvatarDir].forEach((dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});


const createStorage = (uploadDir, prefix) =>
  multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const id = req.user?.id || req.body.communityId || "guest";
      cb(null, `${prefix}-${id}-${Date.now()}${ext}`);
    },
  });


const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Chỉ cho phép upload file ảnh (jpg, jpeg, png)"));
};


const limits = { fileSize: 5 * 1024 * 1024 };



export const uploadUserAvatar = multer({ storage: createStorage(avatarDir, "user"), fileFilter, limits });
export const uploadCommunityAvatar = multer({ storage: createStorage(communityAvatarDir, "community"), fileFilter, limits });

const postImagesDir = path.join(process.cwd(), "src/assets/uploads/posts");
if (!fs.existsSync(postImagesDir)) fs.mkdirSync(postImagesDir, { recursive: true });
export const uploadPostImages = multer({ storage: createStorage(postImagesDir, "post"), fileFilter, limits });


const videoFilter = (req, file, cb) => {
  const allowed = /mp4|webm|ogg/;
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.test(ext)) cb(null, true);
  else cb(new Error("Chỉ cho phép upload video (mp4, webm, ogg)"));
};

const videoLimits = { fileSize: 50 * 1024 * 1024 }; 

const postVideosDir = path.join(process.cwd(), "src/assets/uploads/videos");
if (!fs.existsSync(postVideosDir)) fs.mkdirSync(postVideosDir, { recursive: true });
export const uploadPostVideo = multer({
  storage: createStorage(postVideosDir, "video"),
  fileFilter: videoFilter,
  limits: videoLimits
});


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
  limits: { fileSize: 50 * 1024 * 1024 }, 
});

export const uploadPostMedia = postMediaUploader.fields([
  { name: 'images', maxCount: 4 },
  { name: 'video', maxCount: 1 }
]);


const commentImagesDir = path.join(process.cwd(), "src/assets/uploads/comments");
if (!fs.existsSync(commentImagesDir)) fs.mkdirSync(commentImagesDir, { recursive: true });

export const uploadCommentImage = multer({
  storage: createStorage(commentImagesDir, "comment"),
  fileFilter,
  limits
}).single('image');

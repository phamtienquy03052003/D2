import express from "express";
import {
  createReport,

  ownerGroupedReportsMulti,
  ownerReportsDetail,
  ownerDeleteTarget,
  ownerUpdateReportStatus,

  adminGroupedReports,
  adminAllReports,
  adminUpdateReportStatus,
} from "../controllers/reportController.js";

import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { validateCreateReport, validateUpdateReportStatus } from "../validators/reportValidator.js";
import { validateRequest } from "../middleware/validationMiddleware.js";

const router = express.Router();

/**
 * Routes báo cáo vi phạm (Reports)
 */

router.post("/", verifyToken, validateCreateReport, validateRequest, createReport); // Tạo báo cáo

// --- Owner (Chủ cộng đồng) ---
router.get("/owner/grouped", verifyToken, ownerGroupedReportsMulti); // Báo cáo trong cộng đồng mình quản lý
router.get("/owner/target/:targetId", verifyToken, ownerReportsDetail); // Chi tiết báo cáo
router.delete("/owner/delete/:targetType/:targetId", verifyToken, ownerDeleteTarget); // Xóa nội dung vi phạm
router.patch("/owner/status/:reportId", verifyToken, validateUpdateReportStatus, validateRequest, ownerUpdateReportStatus); // Cập nhật trạng thái

// --- Admin ---
router.get("/admin/grouped", verifyToken, isAdmin, adminGroupedReports);
router.get("/admin/all", verifyToken, isAdmin, adminAllReports);
router.patch("/admin/:reportId", verifyToken, isAdmin, validateUpdateReportStatus, validateRequest, adminUpdateReportStatus);

export default router;

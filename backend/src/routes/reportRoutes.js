import express from "express";
import {
  createReport,

  ownerGroupedReportsMulti,
  ownerReportsDetail,
  ownerDeleteTarget,

  adminGroupedReports,
  adminAllReports,
  adminUpdateReportStatus,
} from "../controllers/reportController.js";

import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* USER */
router.post("/", verifyToken, createReport);

/* OWNER – NEW VERSION */
router.get("/owner/grouped", verifyToken, ownerGroupedReportsMulti);
router.get("/owner/target/:targetId", verifyToken, ownerReportsDetail);
router.delete("/owner/delete/:targetType/:targetId", verifyToken, ownerDeleteTarget);

/* ADMIN (giữ nguyên) */
router.get("/admin/grouped", verifyToken, isAdmin, adminGroupedReports);
router.get("/admin/all", verifyToken, isAdmin, adminAllReports);
router.patch("/admin/:reportId", verifyToken, isAdmin, adminUpdateReportStatus);

export default router;

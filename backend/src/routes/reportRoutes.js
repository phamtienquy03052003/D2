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


router.post("/", verifyToken, validateCreateReport, validateRequest, createReport);


router.get("/owner/grouped", verifyToken, ownerGroupedReportsMulti);
router.get("/owner/target/:targetId", verifyToken, ownerReportsDetail);
router.delete("/owner/delete/:targetType/:targetId", verifyToken, ownerDeleteTarget);
router.patch("/owner/status/:reportId", verifyToken, validateUpdateReportStatus, validateRequest, ownerUpdateReportStatus);


router.get("/admin/grouped", verifyToken, isAdmin, adminGroupedReports);
router.get("/admin/all", verifyToken, isAdmin, adminAllReports);
router.patch("/admin/:reportId", verifyToken, isAdmin, validateUpdateReportStatus, validateRequest, adminUpdateReportStatus);

export default router;

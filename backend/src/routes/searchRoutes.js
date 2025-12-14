import express from "express";
import { fullTextSearch } from "../controllers/searchController.js";

const router = express.Router();

/**
 * Routes tìm kiếm toàn cục (Global Search)
 */
router.get("/", fullTextSearch);

export default router;

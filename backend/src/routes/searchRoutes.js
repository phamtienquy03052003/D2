import express from "express";
import { fullTextSearch } from "../controllers/searchController.js";

const router = express.Router();

router.get("/", fullTextSearch);

export default router;

import express from "express";
import { globalSearch } from "../../Controller/Search/searchController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

router.use(authenticate);
router.get("/", globalSearch);

export default router;

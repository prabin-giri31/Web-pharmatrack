import express from "express";
import { 
    getAllPurchaseReceives, 
    getPurchaseReceiveById, 
    createPurchaseReceive, 
    updatePurchaseReceive, 
    deletePurchaseReceive,
    getPurchaseReceiveStats 
} from "../../Controller/PurchaseReceive/purchaseReceiveController.js";
import { authenticate } from "../../Middleware/auth.middleware.js";

const router = express.Router();

// All routes are protected
router.use(authenticate);

router.get("/stats", getPurchaseReceiveStats);
router.get("/", getAllPurchaseReceives);
router.get("/:id", getPurchaseReceiveById);
router.post("/", createPurchaseReceive);
router.put("/:id", updatePurchaseReceive);
router.delete("/:id", deletePurchaseReceive);

export default router;

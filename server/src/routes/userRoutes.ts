import { Router } from "express";
import {
  authMiddleware,
  AuthRequest,
} from "../middleware/authMiddleware.js";

const router = Router();

router.get("/me", authMiddleware, (req: AuthRequest, res) => {
  res.json({
    message: "You are authenticated!",
    userId: req.userId,
  });
});

export default router;
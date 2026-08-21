import { Router } from "express";
import { submitQuiz, getMyAttempts, getAttemptById } from "../controllers/attemptController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/quizzes/:quizId/attempts",
  authMiddleware,
  submitQuiz
);

router.get(
  "/attempts",
  authMiddleware,
  getMyAttempts
);

router.get(
  "/attempts/:id",
  authMiddleware,
  getAttemptById
);

export default router;
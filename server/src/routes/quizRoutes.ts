import { Router } from "express";
import {
  createQuiz,
  getMyQuizzes,
  getQuizById,
  updateQuiz,
  deleteQuiz,
  getQuizForTaking,
} from "../controllers/quizController.js";
import {
  submitQuizAttempt,
  getMyAttempts
} from "../controllers/quizAttemptController";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  generateAIQuiz,
} from "../controllers/aiQuizController";

const router = Router();

router.post(
  "/generate",
  authMiddleware,
  generateAIQuiz
);
router.post("/", authMiddleware, createQuiz);
router.get("/", authMiddleware, getMyQuizzes);
router.get(
  "/attempts",
  authMiddleware,
  getMyAttempts
);
router.get("/:id", authMiddleware, getQuizById);
router.put("/:id", authMiddleware, updateQuiz);
router.delete("/:id", authMiddleware, deleteQuiz);
router.get(
  "/:id/take",
  authMiddleware,
  getQuizForTaking
);

router.post(
  "/:id/attempts",
  authMiddleware,
  submitQuizAttempt
);

export default router;
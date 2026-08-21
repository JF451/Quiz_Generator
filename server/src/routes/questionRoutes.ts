import { Router } from "express";
import { createQuestion,
          getQuestions,
          updateQuestion,
          deleteQuestion,
 } from "../controllers/questionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = Router();

router.post(
  "/quizzes/:quizId/questions",
  authMiddleware,
  createQuestion
);

router.get(
  "/quizzes/:quizId/questions",
  authMiddleware,
  getQuestions
);


router.put(
  "/questions/:id",
  authMiddleware,
  updateQuestion
);

router.delete(
  "/questions/:id",
  authMiddleware,
  deleteQuestion
);

export default router;
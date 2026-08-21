import { Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.number().int().positive(),
      answerId: z.number().int().positive(),
    })
  ).min(1),
});

export async function submitQuiz(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const quizId = Number(req.params.quizId);

    if (Number.isNaN(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID",
      });
    }

    const result = submitQuizSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues,
      });
    }

    const { answers: submittedAnswers } = result.data;

    const quiz = await prisma.quiz.findUnique({
      where: {
        id: quizId,
      },
      include: {
        questions: {
          include: {
            answers: true,
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    // Make sure there are no duplicate question IDs
    const questionIds = submittedAnswers.map(
      (answer) => answer.questionId
    );

    const uniqueQuestionIds = new Set(questionIds);

    if (uniqueQuestionIds.size !== questionIds.length) {
      return res.status(400).json({
        message: "You can only submit one answer per question",
      });
    }

    // Make sure every submitted question belongs to this quiz
    for (const submittedAnswer of submittedAnswers) {
      const question = quiz.questions.find(
        (question) =>
          question.id === submittedAnswer.questionId
      );

      if (!question) {
        return res.status(400).json({
          message: `Question ${submittedAnswer.questionId} does not belong to this quiz`,
        });
      }

      // Make sure the selected answer belongs to that question
      const answer = question.answers.find(
        (answer) =>
          answer.id === submittedAnswer.answerId
      );

      if (!answer) {
        return res.status(400).json({
          message: `Answer ${submittedAnswer.answerId} does not belong to question ${question.id}`,
        });
      }
    }

    // Calculate score
    let score = 0;

    for (const submittedAnswer of submittedAnswers) {
      const question = quiz.questions.find(
        (question) =>
          question.id === submittedAnswer.questionId
      );

      if (!question) {
        continue;
      }

      const correctAnswer = question.answers.find(
        (answer) => answer.isCorrect
      );

      if (
        correctAnswer &&
        correctAnswer.id === submittedAnswer.answerId
      ) {
        score++;
      }
    }

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: req.userId,
        score,
      },
    });

    const totalQuestions = quiz.questions.length;

    const percentage =
      totalQuestions > 0
        ? Math.round((score / totalQuestions) * 100)
        : 0;

    return res.status(201).json({
      message: "Quiz submitted successfully",
      result: {
        score,
        totalQuestions,
        percentage,
      },
      attempt,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMyAttempts(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attempts = await prisma.quizAttempt.findMany({
      where: {
        userId: req.userId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    return res.json({
      attempts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getAttemptById(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const attemptId = Number(req.params.id);

    if (Number.isNaN(attemptId)) {
      return res.status(400).json({
        message: "Invalid attempt ID",
      });
    }

    const attempt = await prisma.quizAttempt.findFirst({
      where: {
        id: attemptId,
        userId: req.userId,
      },
      include: {
        quiz: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
      },
    });

    if (!attempt) {
      return res.status(404).json({
        message: "Attempt not found",
      });
    }

    return res.json({
      attempt,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
import { Response } from "express";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware";

export async function submitQuizAttempt(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const quizId = Number(req.params.id);

    if (Number.isNaN(quizId)) {
      return res.status(400).json({
        message: "Invalid quiz ID",
      });
    }

    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Answers must be an array",
      });
    }

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

    let score = 0;

    for (const question of quiz.questions) {
      const submittedAnswer = answers.find(
        (answer: {
          questionId: number;
          answerId: number;
        }) => answer.questionId === question.id
      );

      if (!submittedAnswer) {
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

    const totalQuestions = quiz.questions.length;

    const attempt = await prisma.quizAttempt.create({
      data: {
        quizId,
        userId: req.userId,
        score,
      },
    });

    return res.status(201).json({
      message: "Quiz submitted successfully",
      attempt: {
        id: attempt.id,
        score,
        totalQuestions,
        percentage:
          totalQuestions === 0
            ? 0
            : Math.round(
                (score / totalQuestions) * 100
              ),
      },
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
          include: {
            questions: true,
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    const formattedAttempts = attempts.map(
      (attempt) => {
        const totalQuestions =
          attempt.quiz.questions.length;

        const percentage =
          totalQuestions === 0
            ? 0
            : Math.round(
                (attempt.score / totalQuestions) * 100
              );

        return {
          id: attempt.id,
          score: attempt.score,
          totalQuestions,
          percentage,
          completedAt: attempt.completedAt,
          quiz: {
            id: attempt.quiz.id,
            title: attempt.quiz.title,
          },
        };
      }
    );

    return res.json({
      attempts: formattedAttempts,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
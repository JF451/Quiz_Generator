import { Request, Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const createQuizSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
});

export async function createQuiz(req: AuthRequest, res: Response) {
  try {
    const result = createQuizSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues,
      });
    }

    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { title, description } = result.data;

    const quiz = await prisma.quiz.create({
      data: {
        title,
        description,
        userId: req.userId,
      },
    });

    return res.status(201).json({
      message: "Quiz created successfully",
      quiz,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getMyQuizzes(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const quizzes = await prisma.quiz.findMany({
      where: {
        userId: req.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return res.json({
      quizzes,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getQuizById(
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

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId: req.userId,
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

    return res.json({
      quiz,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

const updateQuizSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().max(500).optional(),
});

export async function updateQuiz(
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

    const { title, description } = req.body;

    if (
      title !== undefined &&
      (typeof title !== "string" ||
        title.trim().length === 0)
    ) {
      return res.status(400).json({
        message: "Title cannot be empty",
      });
    }

    if (
      description !== undefined &&
      description !== null &&
      typeof description !== "string"
    ) {
      return res.status(400).json({
        message: "Description must be a string",
      });
    }

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId: req.userId,
      },
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    const updatedQuiz = await prisma.quiz.update({
      where: {
        id: quizId,
      },
      data: {
        ...(title !== undefined && {
          title: title.trim(),
        }),

        ...(description !== undefined && {
          description,
        }),
      },
    });

    return res.json({
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
} 

export async function deleteQuiz(
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

    const existingQuiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
        userId: req.userId,
      },
    });

    if (!existingQuiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    await prisma.quiz.delete({
      where: {
        id: quizId,
      },
    });

    return res.json({
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getQuizForTaking(
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

    const quiz = await prisma.quiz.findFirst({
      where: {
        id: quizId,
      },
      include: {
        questions: {
          include: {
            answers: {
              select: {
                id: true,
                answerText: true,
              },
            },
          },
        },
      },
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    return res.json({
      quiz,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}


import { Response } from "express";
import { z } from "zod";
import prisma from "../lib/prisma.js";
import { AuthRequest } from "../middleware/authMiddleware.js";

const createQuestionSchema = z.object({
  questionText: z.string().min(1).max(500),

  answers: z
    .array(
      z.object({
        answerText: z.string().min(1).max(255),
        isCorrect: z.boolean(),
      })
    )
    .min(2)
    .max(6),
});

export async function createQuestion(
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

    const result = createQuestionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues,
      });
    }

    const { questionText, answers } = result.data;

    // Make sure the quiz belongs to the logged-in user
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

    // Make sure exactly one answer is correct
    const correctAnswers = answers.filter(
      (answer) => answer.isCorrect
    );

    if (correctAnswers.length !== 1) {
      return res.status(400).json({
        message: "A question must have exactly one correct answer",
      });
    }

    const question = await prisma.question.create({
      data: {
        questionText,
        quizId,
        answers: {
          create: answers,
        },
      },
      include: {
        answers: true,
      },
    });

    return res.status(201).json({
      message: "Question created successfully",
      question,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function getQuestions(
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

    const questions = await prisma.question.findMany({
      where: {
        quizId,
      },
      include: {
        answers: true,
      },
      orderBy: {
        id: "asc",
      },
    });

    return res.json({
      questions,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

const updateQuestionSchema = z.object({
  questionText: z.string().min(1).max(500).optional(),

  answers: z
    .array(
      z.object({
        answerText: z.string().min(1).max(255),
        isCorrect: z.boolean(),
      })
    )
    .min(2)
    .max(6)
    .optional(),
});


export async function updateQuestion(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const questionId = Number(req.params.id);

    if (Number.isNaN(questionId)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    const result = updateQuestionSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Invalid input",
        errors: result.error.issues,
      });
    }

    // Find question and make sure it belongs to this user's quiz
    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        quiz: {
          userId: req.userId,
        },
      },
      include: {
        answers: true,
      },
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    const { questionText, answers } = result.data;

    // If answers are being updated, make sure exactly one is correct
    if (answers) {
      const correctAnswers = answers.filter(
        (answer) => answer.isCorrect
      );

      if (correctAnswers.length !== 1) {
        return res.status(400).json({
          message:
            "A question must have exactly one correct answer",
        });
      }
    }

    // Update question text
    if (questionText !== undefined) {
      await prisma.question.update({
        where: {
          id: questionId,
        },
        data: {
          questionText,
        },
      });
    }

    // Replace answers if provided
    if (answers) {
      await prisma.answer.deleteMany({
        where: {
          questionId,
        },
      });

      await prisma.answer.createMany({
  data: answers.map((answer) => ({
    questionId,
    answerText: answer.answerText,
    isCorrect: answer.isCorrect,
  })),
});
    }

    const updatedQuestion = await prisma.question.findUnique({
      where: {
        id: questionId,
      },
      include: {
        answers: true,
      },
    });

    return res.json({
      message: "Question updated successfully",
      question: updatedQuestion,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

export async function deleteQuestion(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const questionId = Number(req.params.id);

    if (Number.isNaN(questionId)) {
      return res.status(400).json({
        message: "Invalid question ID",
      });
    }

    const question = await prisma.question.findFirst({
      where: {
        id: questionId,
        quiz: {
          userId: req.userId,
        },
      },
    });

    if (!question) {
      return res.status(404).json({
        message: "Question not found",
      });
    }

    await prisma.question.delete({
      where: {
        id: questionId,
      },
    });

    return res.json({
      message: "Question deleted successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}
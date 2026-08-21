import { Response } from "express";
import  prisma  from "../lib/prisma";
import { AuthRequest } from "../middleware/authMiddleware";
import { generateQuiz } from "../services/aiQuizService";

export async function generateAIQuiz(
  req: AuthRequest,
  res: Response
) {
  try {
    if (!req.userId) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const { topic, numberOfQuestions } = req.body;

    if (
      typeof topic !== "string" ||
      topic.trim().length === 0
    ) {
      return res.status(400).json({
        message: "Topic is required",
      });
    }

    if (
      typeof numberOfQuestions !== "number" ||
      !Number.isInteger(numberOfQuestions)
    ) {
      return res.status(400).json({
        message:
          "numberOfQuestions must be an integer",
      });
    }

    if (
      numberOfQuestions < 1 ||
      numberOfQuestions > 20
    ) {
      return res.status(400).json({
        message:
          "Number of questions must be between 1 and 20",
      });
    }

    // Generate the quiz with AI
    const generatedQuiz = await generateQuiz(
      topic.trim(),
      numberOfQuestions
    );

    // Save everything in one transaction
    const savedQuiz = await prisma.$transaction(
      async (tx) => {
        const quiz = await tx.quiz.create({
          data: {
            title: generatedQuiz.title,
            description:
              generatedQuiz.description,
            userId: req.userId!,
          },
        });

        for (const question of generatedQuiz.questions) {
          await tx.question.create({
            data: {
              quizId: quiz.id,
              questionText:
                question.questionText,

              answers: {
                create: question.answers.map(
                  (answer) => ({
                    answerText:
                      answer.answerText,
                    isCorrect:
                      answer.isCorrect,
                  })
                ),
              },
            },
          });
        }

        return tx.quiz.findUnique({
          where: {
            id: quiz.id,
          },
          include: {
            questions: {
              include: {
                answers: true,
              },
            },
          },
        });
      }
    );

    return res.status(201).json({
      message: "AI quiz generated successfully",
      quiz: savedQuiz,
    });
  } catch (error) {
    console.error(
      "AI quiz generation error:",
      error
    );

    return res.status(500).json({
      message: "Failed to generate quiz",
    });
  }
}

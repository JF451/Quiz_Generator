import { z } from "zod";

export const aiQuizSchema = z.object({
  title: z.string().min(1),

  description: z
    .string()
    .nullable(),

  questions: z
    .array(
      z.object({
        questionText: z.string().min(1),

        answers: z
          .array(
            z.object({
              answerText: z.string().min(1),
              isCorrect: z.boolean(),
            })
          )
          .length(4),
      })
    )
    .min(1),
});

export type AIQuiz = z.infer<
  typeof aiQuizSchema
>;
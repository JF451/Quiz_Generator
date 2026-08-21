import OpenAI from "openai";
import { aiQuizSchema, AIQuiz } from "../schemas/aiQuizSchema";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateQuiz(
  topic: string,
  numberOfQuestions: number
): Promise<AIQuiz> {
  const response = await openai.responses.create({
    model: "gpt-5.6-luna",

    input: `
Create a multiple-choice quiz about:

${topic}

Generate exactly ${numberOfQuestions} questions.

Requirements:

- Each question must have exactly 4 answers.
- Exactly ONE answer must be correct.
- The other three answers must be incorrect.
- Questions should test actual understanding of the topic.
- Avoid ambiguous questions.
- Do not include question numbers.
- Do not include IDs.
- Return only the requested quiz data.
    `,

    text: {
      format: {
        type: "json_schema",
        name: "quiz",
        strict: true,
        schema: {
          type: "object",
          properties: {
            title: {
              type: "string",
            },
            description: {
              type: ["string", "null"],
            },
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  questionText: {
                    type: "string",
                  },
                  answers: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        answerText: {
                          type: "string",
                        },
                        isCorrect: {
                          type: "boolean",
                        },
                      },
                      required: [
                        "answerText",
                        "isCorrect",
                      ],
                      additionalProperties: false,
                    },
                  },
                },
                required: [
                  "questionText",
                  "answers",
                ],
                additionalProperties: false,
              },
            },
          },
          required: [
            "title",
            "description",
            "questions",
          ],
          additionalProperties: false,
        },
      },
    },
  });

  if (!response.output_text) {
    throw new Error(
      "AI returned an empty response"
    );
  }

  const parsed = JSON.parse(
    response.output_text
  );

  const result = aiQuizSchema.safeParse(parsed);

  if (!result.success) {
    console.error(
      "Invalid AI quiz:",
      result.error
    );

    throw new Error(
      "AI generated an invalid quiz"
    );
  }

  return result.data;
}
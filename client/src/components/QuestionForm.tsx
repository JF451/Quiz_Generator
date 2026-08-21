import { useState } from "react";
import { apiRequest } from "../services/api";

interface QuestionFormProps {
  quizId: number;
  onQuestionCreated: () => void;
}

interface AnswerInput {
  answerText: string;
  isCorrect: boolean;
}

export default function QuestionForm({
  quizId,
  onQuestionCreated,
}: QuestionFormProps) {
  const [questionText, setQuestionText] = useState("");

  const [answers, setAnswers] = useState<AnswerInput[]>([
    {
      answerText: "",
      isCorrect: false,
    },
    {
      answerText: "",
      isCorrect: false,
    },
    {
      answerText: "",
      isCorrect: false,
    },
    {
      answerText: "",
      isCorrect: false,
    },
  ]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateAnswer(
    index: number,
    answerText: string
  ) {
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, i) =>
        i === index
          ? {
              ...answer,
              answerText,
            }
          : answer
      )
    );
  }

  function selectCorrectAnswer(index: number) {
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, i) => ({
        ...answer,
        isCorrect: i === index,
      }))
    );
  }

  async function handleSubmit(
    event: React.SubmitEvent
  ) {
    event.preventDefault();

    setError("");

    // Make sure exactly one answer is correct
    const correctAnswers = answers.filter(
      (answer) => answer.isCorrect
    );

    if (correctAnswers.length !== 1) {
      setError(
        "Please select exactly one correct answer."
      );
      return;
    }

    setLoading(true);

    try {
      await apiRequest(
        `/quizzes/${quizId}/questions`,
        {
          method: "POST",
          body: JSON.stringify({
            questionText,
            answers,
          }),
        }
      );

      // Reset the form
      setQuestionText("");

      setAnswers([
        {
          answerText: "",
          isCorrect: false,
        },
        {
          answerText: "",
          isCorrect: false,
        },
        {
          answerText: "",
          isCorrect: false,
        },
        {
          answerText: "",
          isCorrect: false,
        },
      ]);

      onQuestionCreated();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add Question</h2>

      {error && <p>{error}</p>}

      <div>
        <label htmlFor="questionText">
          Question
        </label>

        <input
          id="questionText"
          type="text"
          value={questionText}
          onChange={(event) =>
            setQuestionText(event.target.value)
          }
          placeholder="What does === do?"
          required
        />
      </div>

      <h3>Answers</h3>

      {answers.map((answer, index) => (
        <div key={index}>
          <input
            type="text"
            value={answer.answerText}
            onChange={(event) =>
              updateAnswer(
                index,
                event.target.value
              )
            }
            placeholder={`Answer ${index + 1}`}
            required
          />

          <label>
            <input
              type="radio"
              name="correctAnswer"
              checked={answer.isCorrect}
              onChange={() =>
                selectCorrectAnswer(index)
              }
            />

            Correct
          </label>
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Question"}
      </button>
    </form>
  );
}
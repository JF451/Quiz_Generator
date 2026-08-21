import { useState } from "react";
import { apiRequest } from "../services/api";

interface Answer {
  id: number;
  answerText: string;
  isCorrect: boolean;
}

interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
}

interface EditQuestionFormProps {
  question: Question;
  onUpdated: () => void;
  onCancel: () => void;
}

interface AnswerInput {
  answerText: string;
  isCorrect: boolean;
}

export default function EditQuestionForm({
  question,
  onUpdated,
  onCancel,
}: EditQuestionFormProps) {
  const [questionText, setQuestionText] = useState(
    question.questionText
  );

  const [answers, setAnswers] = useState<AnswerInput[]>(
    question.answers.map((answer) => ({
      answerText: answer.answerText,
      isCorrect: answer.isCorrect,
    }))
  );

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
      await apiRequest(`/questions/${question.id}`, {
        method: "PUT",
        body: JSON.stringify({
          questionText,
          answers,
        }),
      });

      onUpdated();
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
      <h3>Edit Question</h3>

      {error && <p>{error}</p>}

      <div>
        <label htmlFor={`question-${question.id}`}>
          Question
        </label>

        <input
          id={`question-${question.id}`}
          type="text"
          value={questionText}
          onChange={(event) =>
            setQuestionText(event.target.value)
          }
          required
        />
      </div>

      <h4>Answers</h4>

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
            required
          />

          <label>
            <input
              type="radio"
              name={`correct-${question.id}`}
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
        {loading ? "Saving..." : "Save Changes"}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
      >
        Cancel
      </button>
    </form>
  );
}
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";

interface Answer {
  id: number;
  answerText: string;
}

interface Question {
  id: number;
  questionText: string;
  answers: Answer[];
}

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  questions: Question[];
}

interface QuizResult {
  score: number;
  totalQuestions: number;
  percentage: number;
}

export default function TakeQuiz() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [selectedAnswers, setSelectedAnswers] =
    useState<Record<number, number>>({});

  const [result, setResult] =
    useState<QuizResult | null>(null);

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function fetchQuiz() {
      try {
        const data = await apiRequest(
          `/quizzes/${id}/take`
        );

        setQuiz(data.quiz);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchQuiz();
  }, [id]);

  function handleAnswerSelect(answerId: number) {
    if (!quiz) {
      return;
    }

    const questionId =
      quiz.questions[currentQuestion].id;

    setSelectedAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: answerId,
    }));
  }

  function handleNext() {
    if (!quiz) {
      return;
    }

    if (
      currentQuestion <
      quiz.questions.length - 1
    ) {
      setCurrentQuestion(
        (currentQuestion) => currentQuestion + 1
      );
    }
  }

  function handlePrevious() {
    if (currentQuestion > 0) {
      setCurrentQuestion(
        (currentQuestion) => currentQuestion - 1
      );
    }
  }

  async function handleSubmit() {
    if (!quiz) {
      return;
    }

    const answers = Object.entries(selectedAnswers).map(
      ([questionId, answerId]) => ({
        questionId: Number(questionId),
        answerId,
      })
    );

    try {
      setError("");
      setSubmitting(true);

      const data = await apiRequest(
        `/quizzes/${quiz.id}/attempts`,
        {
          method: "POST",
          body: JSON.stringify({
            answers,
          }),
        }
      );

      setResult(data.attempt);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetake() {
    setResult(null);
    setCurrentQuestion(0);
    setSelectedAnswers({});
    setError("");
  }

  if (loading) {
    return <p>Loading quiz...</p>;
  }

  if (error) {
    return (
      <main>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <p>{error}</p>
      </main>
    );
  }

  if (!quiz) {
    return (
      <main>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <p>Quiz not found.</p>
      </main>
    );
  }

  if (quiz.questions.length === 0) {
    return (
      <main>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>{quiz.title}</h1>

        <p>
          This quiz doesn't have any questions yet.
        </p>
      </main>
    );
  }

  if (result) {
    return (
      <main>
        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          ← Dashboard
        </button>

        <h1>{quiz.title}</h1>

        <h2>Quiz Complete!</h2>

        <p>
          You scored {result.score} out of{" "}
          {result.totalQuestions}.
        </p>

        <h2>{result.percentage}%</h2>

        <button
          type="button"
          onClick={handleRetake}
        >
          Retake Quiz
        </button>

        <button
          type="button"
          onClick={() => navigate("/dashboard")}
        >
          Back to Dashboard
        </button>
      </main>
    );
  }

  const question =
    quiz.questions[currentQuestion];

  const selectedAnswer =
    selectedAnswers[question.id];

  const isLastQuestion =
    currentQuestion ===
    quiz.questions.length - 1;

  const hasSelectedAnswer =
    selectedAnswer !== undefined;

  return (
    <main>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
      >
        ← Dashboard
      </button>

      <h1>{quiz.title}</h1>

      {quiz.description && (
        <p>{quiz.description}</p>
      )}

      <p>
        Question {currentQuestion + 1} of{" "}
        {quiz.questions.length}
      </p>

      <h2>{question.questionText}</h2>

      <div>
        {question.answers.map((answer) => (
          <label
            key={answer.id}
            style={{
              display: "block",
              marginBottom: "10px",
            }}
          >
            <input
              type="radio"
              name={`question-${question.id}`}
              value={answer.id}
              checked={
                selectedAnswer === answer.id
              }
              onChange={() =>
                handleAnswerSelect(answer.id)
              }
            />

            {" "}

            {answer.answerText}
          </label>
        ))}
      </div>

      <div>
        <button
          type="button"
          onClick={handlePrevious}
          disabled={currentQuestion === 0}
        >
          Previous
        </button>

        {!isLastQuestion ? (
          <button
            type="button"
            onClick={handleNext}
            disabled={!hasSelectedAnswer}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={
              !hasSelectedAnswer || submitting
            }
          >
            {submitting
              ? "Submitting..."
              : "Submit Quiz"}
          </button>
        )}
      </div>
    </main>
  );
}
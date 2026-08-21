import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiRequest } from "../services/api";
import QuestionForm from "../components/QuestionForm";
import EditQuestionForm from "../components/EditQuestionForm";
import EditQuizForm from "../components/EditQuizForm";

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

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  questions: Question[];
}

export default function QuizDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editingQuiz, setEditingQuiz] =
  useState(false);

  const [editingQuestionId, setEditingQuestionId] =
    useState<number | null>(null);

  const [showQuestionForm, setShowQuestionForm] =
    useState(false);

  async function loadQuiz() {
  try {
    setError("");

    const data = await apiRequest(`/quizzes/${id}`);

    setQuiz(data.quiz);
  } catch (error) {
    if (error instanceof Error) {
      setError(error.message);
    }
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
  async function fetchQuiz() {
    try {
      const data = await apiRequest(`/quizzes/${id}`);

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

  async function handleDeleteQuestion(
    questionId: number
  ) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this question?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await apiRequest(`/questions/${questionId}`, {
        method: "DELETE",
      });

      setQuiz((currentQuiz) => {
        if (!currentQuiz) {
          return null;
        }

        return {
          ...currentQuiz,
          questions: currentQuiz.questions.filter(
            (question) => question.id !== questionId
          ),
        };
      });
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    }
  }

  function handleQuestionCreated() {
    setShowQuestionForm(false);
    loadQuiz();
  }

  function handleQuestionUpdated() {
    setEditingQuestionId(null);
    loadQuiz();
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

  return (
    <main>
      {/* Back to Dashboard */}
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
      >
        ← Dashboard
      </button>

      {/* Quiz Information */}
      {editingQuiz ? (
  <EditQuizForm
    quizId={quiz.id}
    initialTitle={quiz.title}
    initialDescription={quiz.description}
    onUpdated={() => {
      setEditingQuiz(false);
      loadQuiz();
    }}
    onCancel={() => {
      setEditingQuiz(false);
    }}
  />
) : (
  <>
    <h1>{quiz.title}</h1>

    {quiz.description && (
      <p>{quiz.description}</p>
    )}

    <button
      type="button"
      onClick={() => setEditingQuiz(true)}
    >
      Edit Quiz
    </button>
  </>
)}

      <button
  type="button"
  onClick={() =>
    navigate(`/quizzes/${quiz.id}/take`)
  }
>
  Take Quiz
</button>

      {quiz.description && (
        <p>{quiz.description}</p>
      )}

      <hr />

      {/* Questions */}
      <h2>Questions</h2>

      {quiz.questions.length === 0 ? (
        <p>
          This quiz doesn't have any questions yet.
        </p>
      ) : (
        quiz.questions.map((question, index) => (
          <div key={question.id}>
            {editingQuestionId === question.id ? (
              /* Edit Question */
              <EditQuestionForm
                question={question}
                onUpdated={handleQuestionUpdated}
                onCancel={() =>
                  setEditingQuestionId(null)
                }
              />
            ) : (
              /* Display Question */
              <>
                <h3>
                  {index + 1}. {question.questionText}
                </h3>

                <ul>
                  {question.answers.map((answer) => (
                    <li key={answer.id}>
                      {answer.answerText}

                      {answer.isCorrect && " ✓"}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  onClick={() =>
                    setEditingQuestionId(question.id)
                  }
                >
                  Edit
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleDeleteQuestion(
                      question.id
                    )
                  }
                >
                  Delete
                </button>
              </>
            )}

            <hr />
          </div>
        ))
      )}

      {/* Add Question */}
      {!showQuestionForm && (
        <button
          type="button"
          onClick={() =>
            setShowQuestionForm(true)
          }
        >
          Add Question
        </button>
      )}

      {showQuestionForm && (
        <QuestionForm
          quizId={quiz.id}
          onQuestionCreated={handleQuestionCreated}
        />
      )}

      {showQuestionForm && (
        <button
          type="button"
          onClick={() =>
            setShowQuestionForm(false)
          }
        >
          Cancel
        </button>
      )}
    </main>
  );
}
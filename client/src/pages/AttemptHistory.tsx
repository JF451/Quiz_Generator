import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

interface Quiz {
  id: number;
  title: string;
}

interface Attempt {
  id: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
  quiz: Quiz;
}

export default function AttemptHistory() {
  const navigate = useNavigate();

  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchAttempts() {
      try {
        const data = await apiRequest(
          "/quizzes/attempts"
        );

        setAttempts(data.attempts);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAttempts();
  }, []);

  if (loading) {
    return <p>Loading attempt history...</p>;
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

  return (
    <main>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
      >
        ← Dashboard
      </button>

      <h1>Attempt History</h1>

      {attempts.length === 0 ? (
        <p>
          You haven't taken any quizzes yet.
        </p>
      ) : (
        <div>
          {attempts.map((attempt) => (
            <div key={attempt.id}>
              <h2>{attempt.quiz.title}</h2>

              <p>
                Score: {attempt.score} /{" "}
                {attempt.totalQuestions}
              </p>

              <p>
                Percentage: {attempt.percentage}%
              </p>

              <p>
                Completed:{" "}
                {new Date(
                  attempt.completedAt
                ).toLocaleString()}
              </p>

              <button
                type="button"
                onClick={() =>
                  navigate(
                    `/quizzes/${attempt.quiz.id}/take`
                  )
                }
              >
                Retake Quiz
              </button>

              <hr />
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
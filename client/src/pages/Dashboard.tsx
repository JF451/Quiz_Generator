import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

interface Quiz {
  id: number;
  title: string;
  description: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const navigate = useNavigate();

  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuizzes() {
      try {
        const data = await apiRequest("/quizzes");

        setQuizzes(data.quizzes);
      } catch (error) {
        if (error instanceof Error) {
          setError(error.message);
        }
      } finally {
        setLoading(false);
      }
    }

    loadQuizzes();
  }, []);

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login");
  }

  if (loading) {
    return <p>Loading quizzes...</p>;
  }

  return (
    <div>
      <header>
        <h1>Quiz Generator</h1>

        <button onClick={handleLogout}>
          Logout
        </button>
      </header>

      <main>
        <div>
          <h2>My Quizzes</h2>

          <button onClick={() => navigate("/quizzes/new")}>
            Create Quiz
          </button>

          <button
  type="button"
  onClick={() =>
    navigate("/quizzes/generate")
  }
>
  🤖 Generate Quiz with AI
</button>

          <button
  type="button"
  onClick={() => navigate("/attempts")}
>
  Attempt History
</button>
        </div>

        {error && <p>{error}</p>}

        {quizzes.length === 0 ? (
          <p>You haven't created any quizzes yet.</p>
        ) : (
          quizzes.map((quiz) => (
            <div key={quiz.id}>
              <h3>{quiz.title}</h3>

              {quiz.description && (
                <p>{quiz.description}</p>
              )}

              <button
                onClick={() =>
                  navigate(`/quizzes/${quiz.id}`)
                }
              >
                View Quiz
              </button>
            </div>
          ))
        )}
      </main>
    </div>
  );
} 
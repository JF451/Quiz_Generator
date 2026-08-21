import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function CreateQuiz() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.SubmitEvent) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await apiRequest("/quizzes", {
        method: "POST",
        body: JSON.stringify({
          title,
          description: description || null,
        }),
      });

      // The backend should return the newly created quiz.
      navigate(`/quizzes/${data.quiz.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Create Quiz</h1>

      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="title">Title</label>

          <input
            id="title"
            type="text"
            value={title}
            onChange={(event) =>
              setTitle(event.target.value)
            }
            placeholder="JavaScript Fundamentals"
            required
          />
        </div>

        <div>
          <label htmlFor="description">
            Description
          </label>

          <textarea
            id="description"
            value={description}
            onChange={(event) =>
              setDescription(event.target.value)
            }
            placeholder="Test your JavaScript knowledge"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Quiz"}
        </button>
      </form>

      <button onClick={() => navigate("/dashboard")}>
        Cancel
      </button>
    </main>
  );
}
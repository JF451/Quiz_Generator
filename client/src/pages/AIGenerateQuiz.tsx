import {useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiRequest } from "../services/api";

export default function AIGenerateQuiz() {
  const navigate = useNavigate();

  const [topic, setTopic] = useState("");
  const [numberOfQuestions, setNumberOfQuestions] =
    useState(10);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setError("");

    if (!topic.trim()) {
      setError("Please enter a topic.");
      return;
    }

    try {
      setLoading(true);

      const data = await apiRequest(
        "/quizzes/generate",
        {
          method: "POST",
          body: JSON.stringify({
            topic: topic.trim(),
            numberOfQuestions,
          }),
        }
      );

      navigate(`/quizzes/${data.quiz.id}`);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("Failed to generate quiz.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <button
        type="button"
        onClick={() => navigate("/dashboard")}
      >
        ← Dashboard
      </button>

      <h1>Generate Quiz with AI 🤖</h1>

      <p>
        Enter a topic and AI will create a
        multiple-choice quiz for you.
      </p>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="topic">
            Topic
          </label>

          <input
            id="topic"
            type="text"
            value={topic}
            onChange={(event) =>
              setTopic(event.target.value)
            }
            placeholder="e.g. JavaScript Promises"
            disabled={loading}
          />
        </div>

        <div>
          <label htmlFor="numberOfQuestions">
            Number of Questions
          </label>

          <input
            id="numberOfQuestions"
            type="number"
            min={1}
            max={20}
            value={numberOfQuestions}
            onChange={(event) =>
              setNumberOfQuestions(
                Number(event.target.value)
              )
            }
            disabled={loading}
          />
        </div>

        {error && (
          <p role="alert">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
        >
          {loading
            ? "Generating Quiz..."
            : "Generate Quiz"}
        </button>
      </form>
    </main>
  );
}
import {useState } from "react";
import { apiRequest } from "../services/api";

interface EditQuizFormProps {
  quizId: number;
  initialTitle: string;
  initialDescription: string | null;
  onUpdated: () => void;
  onCancel: () => void;
}

export default function EditQuizForm({
  quizId,
  initialTitle,
  initialDescription,
  onUpdated,
  onCancel,
}: EditQuizFormProps) {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] =
    useState(initialDescription ?? "");

  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(
    event: React.SubmitEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setError("");
      setSaving(true);

      await apiRequest(`/quizzes/${quizId}`, {
        method: "PUT",
        body: JSON.stringify({
          title,
          description,
        }),
      });

      onUpdated();
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Edit Quiz</h2>

      {error && <p>{error}</p>}

      <div>
        <label htmlFor="title">
          Title
        </label>

        <input
          id="title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
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
        />
      </div>

      <button
        type="submit"
        disabled={saving}
      >
        {saving ? "Saving..." : "Save Changes"}
      </button>

      <button
        type="button"
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </button>
    </form>
  );
}
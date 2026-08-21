import {
  BrowserRouter,
  Navigate,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import QuizDetails from "./pages/QuizDetails";
import TakeQuiz from "./pages/TakeQuiz";
import AttemptHistory from "./pages/AttemptHistory";
import AIGenerateQuiz from "./pages/AIGenerateQuiz";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Send visitors to Login */}
        <Route
          path="/"
          element={<Navigate to="/login" replace />}
        />

        {/* Authentication */}
        <Route
          path="/login"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* Dashboard */}
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* Create quiz */}
        <Route
          path="/quizzes/new"
          element={<CreateQuiz />}
        />

        {/* View quiz */}
        <Route
          path="/quizzes/:id"
          element={<QuizDetails />}
        />

        {/* Take quiz */}
        <Route
          path="/quizzes/:id/take"
          element={<TakeQuiz />}
        />

        {/* Attempt history */}
        <Route
          path="/attempts"
          element={<AttemptHistory />}
        />

        {/* AI quiz generator */}
        <Route
          path="/quizzes/generate"
          element={<AIGenerateQuiz />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
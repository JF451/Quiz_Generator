import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CreateQuiz from "./pages/CreateQuiz";
import QuizDetails from "./pages/QuizDetails";
import TakeQuiz from "./pages/TakeQuiz";
import AttemptHistory from "./pages/AttemptHistory";
import AIGenerateQuiz from "./pages/AIGenerateQuiz";
import Register from "./pages/Register";
import { Navigate } from "react-router-dom";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
        path="/"
        element={<Navigate to="/login" replace />}
      />

      <Route
        path="/login"
        element={<Login />}
      />
      
        <Route
  path="/register"
  element={<Register />}
/>
        <Route
          path="/dashboard"
          element={<Dashboard />}
        />
        <Route
  path="/quizzes/new"
  element={<CreateQuiz />}
/>
<Route
    path="/quizzes/:id"
    element={<QuizDetails />}
  />

  <Route
  path="/quizzes/:id/take"
  element={<TakeQuiz />}
/>

<Route
  path="/attempts"
  element={<AttemptHistory />}
/>

<Route
  path="/quizzes/generate"
  element={<AIGenerateQuiz />}
/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
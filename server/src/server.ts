import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import prisma from "./lib/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import quizRoutes from "./routes/quizRoutes.js";
import questionRoutes from "./routes/questionRoutes.js";
import attemptRoutes from "./routes/attemptRoutes.js";


dotenv.config();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://sweet-lokum-4ee80c.netlify.app",
    ],
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({
    message: "Quiz Generator API is running",
  });
});

app.get("/api/test-db", async (_req, res) => {
  try {
    const users = await prisma.user.findMany();

    res.json({
      message: "Database connection works!",
      users,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/quizzes", quizRoutes);
app.use("/api", questionRoutes);
app.use("/api", attemptRoutes);


app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import userRoutes from "./routes/users";
import taskRoutes from "./routes/tasks";
import authRoutes from "./routes/auth";

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging (helps debug in docker logs)
app.use((req: Request, _res: Response, next: () => void) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);

app.get("/", (req: Request, res: Response) => {
  res.send("TaskMaster API is running");
});

// Error handling middleware (must have 4 args for Express to recognize it)
app.use((err: any, req: Request, res: Response, _next: () => void) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Something went wrong",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`server is running on ${port}`);
});

export default app;

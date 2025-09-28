import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import csurf from "csurf";
import { tasksRouter } from "./routes/tasks.routes.js";

const app = express();
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const NODE_ENV = process.env.NODE_ENV ?? "development";
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN ?? "http://localhost:4200";
const XSRF_COOKIE_NAME = process.env.XSRF_COOKIE_NAME ?? "XSRF-TOKEN";
const XSRF_HEADER_NAME = (process.env.XSRF_HEADER_NAME ?? "X-XSRF-TOKEN").toLowerCase();

app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true
}));

const csrfProtection = csurf({
  cookie: {
    httpOnly: false,
    sameSite: "lax",
    secure: NODE_ENV === "production"
  },
  ignoreMethods: ["GET", "HEAD", "OPTIONS"]
});
app.use(csrfProtection);

app.get("/api/csrf", (req, res) => {
  const token = req.csrfToken();
  res.cookie(XSRF_COOKIE_NAME, token, {
    httpOnly: false,
    sameSite: "lax",
    secure: NODE_ENV === "production"
  });
  res.json({ csrfToken: token });
});

app.use((req, _res, next) => {
  const candidate = req.headers[XSRF_HEADER_NAME];
  if (candidate && !req.headers["x-xsrf-token"]) {
    req.headers["x-xsrf-token"] = Array.isArray(candidate) ? candidate[0] : candidate;
  }
  next();
});

app.use("/api/tasks", tasksRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (err.code === "EBADCSRFTOKEN") {
    return res.status(403).json({ message: "Invalid CSRF token" });
  }
  const status = err.status || 500;
  res.status(status).json({ message: err.message ?? "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`API running on http://localhost:${PORT}`);
});

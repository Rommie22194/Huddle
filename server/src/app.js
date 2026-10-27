import express from "express";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import authRoutes from "./routes/auth.js";
import roomRoutes from "./routes/rooms.js";
import bookingRoutes from "./routes/bookings.js";
import adminRoutes from "./routes/admin.js";
import { errorHandler } from "./lib/errors.js";

const app = express();

app.set("trust proxy", 1); // running behind Render / Vercel proxies
app.use(helmet());
app.use(express.json({ limit: "100kb" }));
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.use("/api/auth", authRoutes);
app.use("/api/rooms", roomRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin", adminRoutes);

app.use("/api", (req, res) => res.status(404).json({ error: "API route not found" }));
app.use(errorHandler);

export default app;

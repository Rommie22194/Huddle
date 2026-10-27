import { ZodError } from "zod";
import { Prisma } from "@prisma/client";

/** Throw this anywhere in a route to send { error } with a status code */
export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

/** Express error-handling middleware: turns any thrown error into clean JSON */
export function errorHandler(err, req, res, _next) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: err.issues[0]?.message ?? "Invalid input", issues: err.issues });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const field = err.meta?.target?.[0] ?? "value";
      return res.status(409).json({ error: `This ${field} is already in use` });
    }
    if (err.code === "P2025") return res.status(404).json({ error: "Not found" });
  }
  if (err.type === "entity.parse.failed") {
    return res.status(400).json({ error: "Invalid JSON body" });
  }
  console.error(err);
  res.status(500).json({ error: "Internal server error" });
}

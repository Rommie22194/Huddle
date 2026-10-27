import jwt from "jsonwebtoken";
import { HttpError } from "./errors.js";

export const COOKIE_NAME = "mrbs_token";
const MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/** Create a JWT for the user and store it in an httpOnly cookie */
export function setSessionCookie(res, user) {
  const payload = { sub: user.id, name: user.name, email: user.email, role: user.role };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: MAX_AGE,
    path: "/",
  });
}

export function clearSessionCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

/** Middleware: requires a valid login, puts the user into req.user */
export function requireUser(req, _res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) throw new HttpError(401, "Please log in");
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new HttpError(401, "Session expired, please log in again");
  }
  next();
}

/** Middleware: requires an ADMIN user (use after requireUser) */
export function requireAdmin(req, _res, next) {
  if (req.user?.role !== "ADMIN") throw new HttpError(403, "Admin only");
  next();
}

import { Router } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/errors.js";
import { clearSessionCookie, requireUser, setSessionCookie } from "../lib/auth.js";
import { loginSchema, passwordSchema, profileSchema, registerSchema } from "../lib/validators.js";

const router = Router();
const publicUser = (u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, department: u.department });

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const data = registerSchema.parse(req.body);

  const exists = await prisma.user.findUnique({ where: { email: data.email } });
  if (exists) throw new HttpError(409, "This email is already registered");

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      department: data.department || null,
      passwordHash: await bcrypt.hash(data.password, 10),
    },
  });

  setSessionCookie(res, user);
  res.status(201).json(publicUser(user));
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const data = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({ where: { email: data.email } });
  // Same message for both cases so attackers can't tell which emails exist
  if (!user || !(await bcrypt.compare(data.password, user.passwordHash))) {
    throw new HttpError(401, "Incorrect email or password");
  }

  setSessionCookie(res, user);
  res.json(publicUser(user));
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  clearSessionCookie(res);
  res.json({ success: true });
});

// GET /api/auth/me
router.get("/me", requireUser, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user) throw new HttpError(401, "Account no longer exists");
  res.json(publicUser(user));
});

// PUT /api/auth/profile - update own name / department
router.put("/profile", requireUser, async (req, res) => {
  const data = profileSchema.parse(req.body);
  const user = await prisma.user.update({
    where: { id: req.user.sub },
    data: { name: data.name, department: data.department || null },
  });
  setSessionCookie(res, user); // token carries the name, so refresh it
  res.json(publicUser(user));
});

// PUT /api/auth/password - change own password
router.put("/password", requireUser, async (req, res) => {
  const data = passwordSchema.parse(req.body);
  const user = await prisma.user.findUnique({ where: { id: req.user.sub } });
  if (!user || !(await bcrypt.compare(data.currentPassword, user.passwordHash))) {
    throw new HttpError(400, "Current password is incorrect");
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await bcrypt.hash(data.newPassword, 10) },
  });
  res.json({ success: true });
});

export default router;

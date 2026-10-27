import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/errors.js";
import { requireUser } from "../lib/auth.js";
import { assertBookable } from "../lib/bookings.js";
import { bookingSchema } from "../lib/validators.js";

const router = Router();
router.use(requireUser);

const toData = (data) => ({
  title: data.title,
  description: data.description || null,
  attendees: data.attendees,
  startTime: data.startTime,
  endTime: data.endTime,
  roomId: data.roomId,
});

/** Load a booking and make sure the caller owns it (or is admin) */
async function loadOwned(id, user) {
  const booking = await prisma.booking.findUnique({
    where: { id },
    include: { room: true, user: { select: { name: true, email: true } } },
  });
  if (!booking) throw new HttpError(404, "Booking not found");
  if (booking.userId !== user.sub && user.role !== "ADMIN") {
    throw new HttpError(403, "You can only manage your own bookings");
  }
  return booking;
}

// GET /api/bookings?scope=all (admin) | default: my bookings
router.get("/", async (req, res) => {
  const all = req.query.scope === "all" && req.user.role === "ADMIN";
  const bookings = await prisma.booking.findMany({
    where: all ? {} : { userId: req.user.sub },
    orderBy: { startTime: "desc" },
    include: {
      room: { select: { id: true, name: true, location: true, capacity: true } },
      user: { select: { name: true, email: true, department: true } },
    },
  });
  res.json(bookings);
});

// POST /api/bookings
router.post("/", async (req, res) => {
  const data = bookingSchema.parse(req.body);
  await assertBookable(data);
  const booking = await prisma.booking.create({
    data: { ...toData(data), userId: req.user.sub },
    include: { room: { select: { name: true } } },
  });
  res.status(201).json(booking);
});

// GET /api/bookings/:id
router.get("/:id", async (req, res) => {
  res.json(await loadOwned(req.params.id, req.user));
});

// PUT /api/bookings/:id - edit title/time/room
router.put("/:id", async (req, res) => {
  const existing = await loadOwned(req.params.id, req.user);
  if (existing.status === "CANCELLED") throw new HttpError(400, "Cancelled bookings cannot be edited");

  const data = bookingSchema.parse(req.body);
  await assertBookable(data, existing.id);
  const booking = await prisma.booking.update({ where: { id: existing.id }, data: toData(data) });
  res.json(booking);
});

// DELETE /api/bookings/:id - cancel (soft delete keeps history for reports)
router.delete("/:id", async (req, res) => {
  const existing = await loadOwned(req.params.id, req.user);
  if (existing.status === "CANCELLED") throw new HttpError(400, "Booking is already cancelled");
  const booking = await prisma.booking.update({ where: { id: existing.id }, data: { status: "CANCELLED" } });
  res.json(booking);
});

export default router;

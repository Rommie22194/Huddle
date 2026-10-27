import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAdmin, requireUser } from "../lib/auth.js";

const router = Router();
router.use(requireUser, requireAdmin);

// GET /api/admin/stats
router.get("/stats", async (req, res) => {
  const now = new Date();
  const [rooms, users, upcoming, cancelled, byRoom, roomNames] = await Promise.all([
    prisma.room.count({ where: { isActive: true } }),
    prisma.user.count(),
    prisma.booking.count({ where: { status: "CONFIRMED", endTime: { gt: now } } }),
    prisma.booking.count({ where: { status: "CANCELLED" } }),
    prisma.booking.groupBy({ by: ["roomId"], where: { status: "CONFIRMED" }, _count: { _all: true } }),
    prisma.room.findMany({ select: { id: true, name: true } }),
  ]);

  const usage = roomNames
    .map((r) => ({ name: r.name, count: byRoom.find((b) => b.roomId === r.id)?._count._all ?? 0 }))
    .sort((a, b) => b.count - a.count);

  res.json({ rooms, users, upcoming, cancelled, usage });
});

/** Quote a value for CSV (handles commas, quotes and new lines) */
const csvCell = (v) => {
  const s = v == null ? "" : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

// Bangkok local time "YYYY-MM-DD HH:mm" (server runs in UTC on Render)
const bkk = (d) =>
  new Date(d.getTime() + 7 * 3600_000).toISOString().slice(0, 16).replace("T", " ");

// GET /api/admin/bookings.csv?roomId= -> download all bookings as CSV (opens in Excel)
router.get("/bookings.csv", async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: req.query.roomId ? { roomId: String(req.query.roomId) } : {},
    orderBy: { startTime: "desc" },
    include: { room: { select: { name: true } }, user: { select: { name: true, email: true, department: true } } },
  });

  const header = ["Title", "Room", "Start", "End", "Attendees", "Status", "Booked by", "Email", "Department", "Notes"];
  const rows = bookings.map((b) => [
    b.title, b.room.name, bkk(b.startTime), bkk(b.endTime), b.attendees, b.status,
    b.user.name, b.user.email, b.user.department, b.description,
  ]);
  const csv = [header, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");

  const today = new Date().toISOString().slice(0, 10);
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="bookings-${today}.csv"`);
  res.send("﻿" + csv); // BOM so Excel reads Thai text correctly
});

export default router;

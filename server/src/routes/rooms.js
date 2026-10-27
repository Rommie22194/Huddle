import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/errors.js";
import { requireAdmin, requireUser } from "../lib/auth.js";
import { roomSchema } from "../lib/validators.js";

const router = Router();
router.use(requireUser);

const clean = (data) => ({ ...data, description: data.description || null, imageUrl: data.imageUrl || null });

// GET /api/rooms?q=&minCapacity=&all=1
router.get("/", async (req, res) => {
  const q = req.query.q?.trim();
  const minCapacity = Number(req.query.minCapacity) || undefined;
  const includeInactive = req.query.all === "1" && req.user.role === "ADMIN";

  const rooms = await prisma.room.findMany({
    where: {
      ...(includeInactive ? {} : { isActive: true }),
      ...(minCapacity ? { capacity: { gte: minCapacity } } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { location: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { name: "asc" },
  });
  res.json(rooms);
});

// GET /api/rooms/schedule?from=ISO&to=ISO -> every active room with its bookings in that range
// (used by the daily availability board). Must be declared before "/:id".
router.get("/schedule", async (req, res) => {
  const from = new Date(req.query.from ?? "");
  const to = new Date(req.query.to ?? "");
  if (isNaN(from.getTime()) || isNaN(to.getTime()) || to <= from) {
    throw new HttpError(400, "from and to must be valid dates");
  }
  if (to - from > 7 * 24 * 3600_000) throw new HttpError(400, "Range can be at most 7 days");

  const rooms = await prisma.room.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    include: {
      bookings: {
        where: { status: "CONFIRMED", startTime: { lt: to }, endTime: { gt: from } },
        orderBy: { startTime: "asc" },
        select: { id: true, title: true, startTime: true, endTime: true, user: { select: { name: true } } },
      },
    },
  });
  res.json(rooms);
});

// GET /api/rooms/:id?from=ISO&to=ISO -> room + confirmed bookings in that range
router.get("/:id", async (req, res) => {
  const from = new Date(req.query.from ?? "");
  const to = new Date(req.query.to ?? "");
  const hasRange = !isNaN(from.getTime()) && !isNaN(to.getTime());

  const room = await prisma.room.findUnique({
    where: { id: req.params.id },
    include: {
      bookings: {
        where: {
          status: "CONFIRMED",
          ...(hasRange ? { startTime: { lt: to }, endTime: { gt: from } } : { endTime: { gt: new Date() } }),
        },
        orderBy: { startTime: "asc" },
        include: { user: { select: { name: true, department: true } } },
      },
    },
  });
  if (!room) throw new HttpError(404, "Room not found");
  res.json(room);
});

// POST /api/rooms (admin)
router.post("/", requireAdmin, async (req, res) => {
  const data = roomSchema.parse(req.body);
  const room = await prisma.room.create({ data: clean(data) });
  res.status(201).json(room);
});

// PUT /api/rooms/:id (admin)
router.put("/:id", requireAdmin, async (req, res) => {
  const data = roomSchema.parse(req.body);
  const room = await prisma.room.update({ where: { id: req.params.id }, data: clean(data) });
  res.json(room);
});

// DELETE /api/rooms/:id (admin) - also removes its bookings (cascade)
router.delete("/:id", requireAdmin, async (req, res) => {
  await prisma.room.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export default router;

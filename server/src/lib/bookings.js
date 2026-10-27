import { prisma } from "./prisma.js";
import { HttpError } from "./errors.js";

/**
 * Business rules shared by create and update:
 * - room must exist and be active
 * - attendees must fit the room capacity
 * - no overlap with another CONFIRMED booking in the same room
 *   (two ranges overlap when existing.start < new.end AND existing.end > new.start)
 */
export async function assertBookable(input, excludeBookingId) {
  const room = await prisma.room.findUnique({ where: { id: input.roomId } });
  if (!room || !room.isActive) throw new HttpError(404, "Room not found or unavailable");
  if (input.attendees > room.capacity) {
    throw new HttpError(400, `This room fits at most ${room.capacity} people`);
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      roomId: input.roomId,
      status: "CONFIRMED",
      startTime: { lt: input.endTime },
      endTime: { gt: input.startTime },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
  });
  if (conflict) throw new HttpError(409, "This room is already booked for the selected time");
}

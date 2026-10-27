import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const admin = await prisma.user.upsert({
    where: { email: "admin@mrbs.com" },
    update: {},
    create: {
      name: "System Admin",
      email: "admin@mrbs.com",
      passwordHash: await bcrypt.hash("Admin@1234", 10),
      role: "ADMIN",
      department: "IT",
    },
  });

  const user = await prisma.user.upsert({
    where: { email: "user@mrbs.com" },
    update: {},
    create: {
      name: "Demo User",
      email: "user@mrbs.com",
      passwordHash: await bcrypt.hash("User@1234", 10),
      department: "Marketing",
    },
  });

  const rooms = [
    { name: "Ocean", location: "Building A, Floor 2", capacity: 6, equipment: ["TV", "Whiteboard"], description: "Small room for quick team syncs." },
    { name: "Mountain", location: "Building A, Floor 3", capacity: 12, equipment: ["Projector", "Whiteboard", "Video Conference"], description: "Medium room for team meetings and workshops." },
    { name: "Galaxy", location: "Building B, Floor 1", capacity: 30, equipment: ["Projector", "Microphone", "Speaker", "Video Conference"], description: "Large room for seminars and town halls." },
    { name: "Forest", location: "Building B, Floor 2", capacity: 4, equipment: ["TV"], description: "Focus room for interviews or 1:1." },
  ];
  for (const r of rooms) {
    await prisma.room.upsert({ where: { name: r.name }, update: {}, create: r });
  }

  // Sample booking tomorrow 10:00-11:00 Thailand time (UTC+7 = 03:00 UTC)
  if ((await prisma.booking.count()) === 0) {
    const ocean = await prisma.room.findUniqueOrThrow({ where: { name: "Ocean" } });
    const d = new Date();
    d.setUTCDate(d.getUTCDate() + 1);
    const start = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 3, 0));
    await prisma.booking.create({
      data: {
        title: "Weekly Sync",
        attendees: 5,
        startTime: start,
        endTime: new Date(start.getTime() + 60 * 60 * 1000),
        userId: user.id,
        roomId: ocean.id,
      },
    });
  }

  console.log("Seed done:", admin.email, user.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

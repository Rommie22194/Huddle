import { z } from "zod";

const MAX_BOOKING_HOURS = 8;

const passwordRule = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(/[A-Za-z]/, "Password must contain a letter")
  .regex(/[0-9]/, "Password must contain a number");

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: passwordRule,
  department: z.string().trim().max(100).optional().or(z.literal("")),
});

export const profileSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  department: z.string().trim().max(100).optional().or(z.literal("")),
});

export const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordRule,
  })
  .refine((p) => p.currentPassword !== p.newPassword, {
    message: "New password must be different from the current one",
    path: ["newPassword"],
  });

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export const roomSchema = z.object({
  name: z.string().trim().min(1, "Room name is required").max(50),
  location: z.string().trim().min(1, "Location is required").max(100),
  capacity: z.coerce.number().int("Capacity must be a whole number").min(1, "Capacity must be at least 1").max(500),
  equipment: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  description: z.string().trim().max(500).optional().or(z.literal("")),
  imageUrl: z.string().trim().url("Image URL must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
});

export const bookingSchema = z
  .object({
    roomId: z.string().min(1, "Room is required"),
    title: z.string().trim().min(1, "Title is required").max(100),
    description: z.string().trim().max(500).optional().or(z.literal("")),
    attendees: z.coerce.number().int().min(1, "Attendees must be at least 1").max(500),
    startTime: z.coerce.date({ message: "Invalid start time" }),
    endTime: z.coerce.date({ message: "Invalid end time" }),
  })
  .refine((b) => b.endTime > b.startTime, { message: "End time must be after start time", path: ["endTime"] })
  .refine((b) => b.startTime.getTime() > Date.now() - 60_000, { message: "Cannot book in the past", path: ["startTime"] })
  .refine((b) => b.endTime.getTime() - b.startTime.getTime() <= MAX_BOOKING_HOURS * 3600_000, {
    message: `A booking can be at most ${MAX_BOOKING_HOURS} hours`,
    path: ["endTime"],
  });

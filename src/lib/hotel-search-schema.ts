import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use YYYY-MM-DD dates.");

export const hotelSearchSchema = z
  .object({
    city: z.string().min(2, "City is required."),
    checkIn: isoDate,
    checkOut: isoDate,
  })
  .refine((data) => data.checkOut > data.checkIn, {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  });

export type HotelSearchInput = z.infer<typeof hotelSearchSchema>;

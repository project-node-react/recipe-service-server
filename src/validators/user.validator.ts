import { z } from "zod";
import { registry } from "../openapi.ts";

export const UserIdParamsSchema = registry.register(
  "UserIdParams",
  z.object({
    userId: z.string().openapi({
      example: "64c8d958249fae54bae90bb9",
      description: "ID of the user to fetch",
    }),
  }),
);

export type UserIdParams = z.infer<typeof UserIdParamsSchema>;

export const UserProfileResponseSchema = registry.register(
  "UserProfileResponse",
  z.object({
    id: z.string().openapi({
      example: "64c8d958249fae54bae90bb9",
    }),
    name: z.string().openapi({
      example: "ivan_petrenko",
    }),
    email: z.email().openapi({
      example: "ivan@example.com",
    }),
    avatar: z.string().nullable().openapi({
      example:
        "https://res.cloudinary.com/dzxdn99qc/image/upload/v1786188885/avatars/nnzjc2gtqrawrmifzv4w.jpg",
    }),
    recipesCount: z.number().int().min(0).openapi({
      example: 42,
      description: "Number of recipes created by the user",
    }),
    followersCount: z.number().int().min(0).openapi({
      example: 127,
      description: "Number of followers the user has",
    }),
    createdAt: z.iso.datetime().openapi({
      example: "2025-01-10T12:00:00.000Z",
    }),
  }),
);

export type UserProfileResponse = z.infer<
  typeof UserProfileResponseSchema
>;

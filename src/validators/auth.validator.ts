import { z } from "zod";
import { registry } from "../openapi.ts";

export const RegisterSchema = registry.register(
  "Register",
  z.object({
    name: z
      .string()
      .regex(/^[a-zA-Z0-9_]+$/)
      .min(3)
      .max(30)
      .openapi({ example: "ivan_petrenko" }),
    email: z.email().openapi({ example: "ivan@example.com" }),
    password: z.string().min(8).openapi({ example: "ivan!pass" }),
  }),
);

export const LoginSchema = registry.register(
  "Login",
  z.object({
    name: z.string().openapi({ example: "ivan_petrenko" }),
    password: z.string().openapi({ example: "ivan!pass" }),
  }),
);

export const UserSchema = registry.register(
  "User",
  z.object({
    id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
    name: z.string().openapi({ example: "ivan_petrenko" }),
    email: z.email().openapi({ example: "ivan@example.com" }),
    avatar: z.string().nullable().optional().openapi({
      example:
        "https://res.cloudinary.com/dzxdn99qc/image/upload/v1786188885/avatars/nnzjc2gtqrawrmifzv4w.jpg",
    }),
    createdAt: z.iso
      .datetime()
      .openapi({ example: "2025-01-10T12:00:00.000Z" }),
  }),
);

export type RegisterBody = z.infer<typeof RegisterSchema>;
export type LoginBody = z.infer<typeof LoginSchema>;

registry.registerPath({
  method: "post",
  path: "/api/auth/register",
  tags: ["Auth"],
  summary: "Register a new user",
  request: {
    body: {
      content: {
        "application/json": { schema: RegisterSchema },
      },
    },
  },
  responses: {
    201: { description: "User registered successfully" },
    409: { description: "Username or email already taken" },
    422: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/login",
  tags: ["Auth"],
  summary: "Login user",
  request: {
    body: {
      content: {
        "application/json": { schema: LoginSchema },
      },
    },
  },
  responses: {
    200: { description: "Login successful" },
    401: { description: "Invalid credentials" },
    422: { description: "Validation error" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/refresh",
  tags: ["Auth"],
  summary: "Refresh token pair",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            refreshToken: z.string().optional().openapi({
              example:
                "6d0c078c1a63ff030538a08969ea7bc255911569f6c250a5b51faaeeda5d4c2f551d65d23db290b3",
            }),
          }),
        },
      },
    },
  },
  responses: {
    200: { description: "Tokens refreshed successfully" },
    401: { description: "Invalid or expired refresh token" },
  },
});

registry.registerPath({
  method: "post",
  path: "/api/auth/logout",
  tags: ["Auth"],
  summary: "Logout user",
  responses: {
    204: { description: "Logged out successfully" },
  },
});

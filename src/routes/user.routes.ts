import { z } from "zod";
import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller.ts";
import {
  UserIdParamsSchema,
  UserProfileResponseSchema,
} from "../validators/user.validator.ts";
import { validateParams } from "../middleware/validate.ts";
import { registry } from "../openapi.ts";

const router = Router();

registry.registerPath({
  method: "get",
  path: "/api/users/{userId}",
  tags: ["Users"],
  summary: "Get user profile",
  description: "Get detailed information about a user by their ID",
  request: {
    params: UserIdParamsSchema,
  },
  responses: {
    200: {
      description: "User profile",
      content: {
        "application/json": {
          schema: UserProfileResponseSchema,
        },
      },
    },
    404: {
      description: "User not found",
      content: {
        "application/json": {
          schema: z.object({
            error: z.string(),
          }),
        },
      },
    },
  },
});

router.get(
  "/:userId",
  validateParams(UserIdParamsSchema),
  getUserProfile,
);

export default router;

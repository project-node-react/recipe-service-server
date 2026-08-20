import { z } from "zod";
import { Router } from "express";
import { getUserProfile } from "../controllers/user.controller.ts";
import {
  UserIdParamsSchema,
} from "../validators/user.validator.ts";
import { validateParams } from "../middleware/validate.ts";

const router = Router();


router.get(
  "/:userId",
  validateParams(UserIdParamsSchema),
  getUserProfile,
);

export default router;

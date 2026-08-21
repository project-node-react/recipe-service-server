import { z } from "zod";
import { Router } from "express";
import { getCurrentUser, getUserProfile } from "../controllers/user.controller.ts";
import {
  UserIdParamsSchema,
} from "../validators/user.validator.ts";
import { validateParams } from "../middleware/validate.ts";
import authenticate from "../middleware/authenticate.ts";

const router = Router();


router.get("/current", authenticate, getCurrentUser);

router.get(
  "/:userId",
  validateParams(UserIdParamsSchema),
  getUserProfile,
);

export default router;

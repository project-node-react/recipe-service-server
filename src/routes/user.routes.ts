import { Router } from "express";
import {
  getUserProfile,
  updateUserAvatar,
  getUserFollowers,
  getUserFollowing,
  followUser,
  unfollowUser,
} from "../controllers/user.controller.ts";
import { UserIdParamsSchema } from "../validators/user.validator.ts";
import { validateParams } from "../middleware/validate.ts";
import authenticate from "../middleware/authenticate.ts";
import { upload } from "../middleware/upload.ts";

const router = Router();

router.get(
  "/:userId/followers",
  authenticate,
  validateParams(UserIdParamsSchema),
  getUserFollowers,
);

router.delete(
  "/:userId/follow",
  authenticate,
  validateParams(UserIdParamsSchema),
  unfollowUser,
);

router.get(
  "/following",
  authenticate,
  getUserFollowing,
);

router.post(
  "/:userId/follow",
  authenticate,
  validateParams(UserIdParamsSchema),
  followUser,
);

router.get(
  "/:userId",
  validateParams(UserIdParamsSchema),
  getUserProfile,
);

router.patch(
  "/avatar",
  authenticate,
  upload.single("avatar"),
  updateUserAvatar,
);

export default router;

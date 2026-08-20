import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { UserIdParams } from "../validators/user.validator.ts";
import logger from "../logger.ts";
import { uploadToCloudinary } from "../services/cloudinary.ts";

export const getUserProfile = async (
  req: Request<UserIdParams>,
  res: Response,
) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    logger.info(
      { userId: user.id, name: user.name },
      "User profile fetched",
    );

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      recipesCount: 0,
      followersCount: 0,
      createdAt: user.createdAt.toISOString(),
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch user profile");

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateUserAvatar = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.sub;

    if (!userId || typeof userId !== "string") {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        error: "Avatar file is required",
      });
    }

    const avatarUrl = await uploadToCloudinary(
      req.file.path,
      "avatars",
    );

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatarUrl,
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    logger.info(
      { userId: user.id },
      "User avatar updated",
    );

    return res.status(200).json({
      avatar: user.avatar,
    });
  } catch (error) {
    logger.error(
      { error },
      "Failed to update user avatar",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserFollowers = async (
  req: Request<UserIdParams>,
  res: Response,
) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const followers = await prisma.follow.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      followers: followers.map(({ follower }) => follower),
    });
  } catch (error) {
    logger.error(
      { error },
      "Failed to fetch user followers",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserFollowing = async (
  req: Request,
  res: Response,
) => {
  try {
    const userId = req.user?.sub;

    if (!userId || typeof userId !== "string") {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const following = await prisma.follow.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return res.status(200).json({
      following: following.map(({ following }) => following),
    });
  } catch (error) {
    logger.error(
      { error },
      "Failed to fetch user following",
    );

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
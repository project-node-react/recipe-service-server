import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { UserIdParams } from "../validators/user.validator.ts";
import logger from "../logger.ts";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub as string;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        _count: {
          select: {
            recipes: true,
            favorites: true,
            followers: true,
            following: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    logger.info(
      { userId: user.id, name: user.name },
      "Current user info fetched",
    );

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      recipesCount: user._count.recipes,
      favoritesCount: user._count.favorites,
      followersCount: user._count.followers,
      followingCount: user._count.following,
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch current user info");

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

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

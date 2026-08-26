import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import type { UserIdParams } from "../validators/user.validator.ts";
import logger from "../logger.ts";
import { uploadToCloudinary } from "../services/cloudinary.ts";

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub as string;

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
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        _count: {
          select: {
            recipes: true,
            followers: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    logger.info({ userId: user.id, name: user.name }, "User profile fetched");

    return res.status(200).json({
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar ?? null,
      recipesCount: user._count.recipes,
      followersCount: user._count.followers,
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch user profile");

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const updateUserAvatar = async (req: Request, res: Response) => {
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

    const avatar = await uploadToCloudinary(req.file.path, "avatars");

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar: avatar,
      },
      select: {
        id: true,
        avatar: true,
      },
    });

    logger.info({ userId: user.id }, "User avatar updated");

    return res.status(200).json({
      avatar: user.avatar,
    });
  } catch (error) {
    logger.error({ error }, "Failed to update user avatar");

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
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 9);
    const skip = (page - 1) * limit;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const [totalFollowers, followers] = await prisma.$transaction([
      prisma.follow.count({
        where: { followingId: userId },
      }),
      prisma.follow.findMany({
        where: { followingId: userId },
        skip,
        take: limit,
        include: {
          follower: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalFollowers / limit);

    return res.status(200).json({
      data: followers.map(({ follower }) => follower),
      totalPages: totalPages === 0 ? 1 : totalPages,
      currentPage: page,
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch user followers");

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const getUserFollowing = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;

    if (!userId || typeof userId !== "string") {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.max(1, parseInt(req.query.limit as string) || 9);
    const skip = (page - 1) * limit;

    const [totalFollowing, following] = await prisma.$transaction([
      prisma.follow.count({
        where: { followerId: userId },
      }),
      prisma.follow.findMany({
        where: { followerId: userId },
        skip,
        take: limit,
        include: {
          following: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      }),
    ]);

    const totalPages = Math.ceil(totalFollowing / limit);

    return res.status(200).json({
      data: following.map(({ following }) => following),
      totalPages: totalPages === 0 ? 1 : totalPages,
      currentPage: page,
    });
  } catch (error) {
    logger.error({ error }, "Failed to fetch user following");

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

export const followUser = async (req: Request<UserIdParams>, res: Response) => {
  try {
    const followerId = req.user?.sub;
    const { userId: followingId } = req.params;

    if (!followerId || typeof followerId !== "string") {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    if (followerId === followingId) {
      return res.status(400).json({
        error: "You cannot follow yourself",
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: followingId },
      select: { id: true },
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      return res.status(409).json({
        error: "Already following this user",
      });
    }

    await prisma.follow.create({
      data: {
        followerId,
        followingId,
      },
    });

    logger.info({ followerId, followingId }, "User followed successfully");

    return res.status(201).json({
      message: "User followed successfully",
    });
  } catch (error) {
    logger.error({ error }, "Failed to follow user");

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};
export const unfollowUser = async (
  req: Request<UserIdParams>,
  res: Response,
) => {
  try {
    const followerId = req.user?.sub;
    const { userId: followingId } = req.params;

    if (!followerId || typeof followerId !== "string") {
      return res.status(401).json({
        error: "Authentication required",
      });
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (!existingFollow) {
      return res.status(404).json({
        error: "You are not following this user",
      });
    }

    await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    logger.info({ followerId, followingId }, "User unfollowed successfully");

    return res.status(200).json({
      message: "User unfollowed successfully",
    });
  } catch (error) {
    logger.error({ error }, "Failed to unfollow user");

    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

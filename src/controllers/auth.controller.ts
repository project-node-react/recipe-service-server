import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";
import { createTokens, setRefreshTokenCookie } from "../services/auth.ts";
import type { RegisterBody, LoginBody } from "../validators/auth.validator.ts";
import logger from "../logger.ts";

export const register = async (
  req: Request<{}, {}, RegisterBody>,
  res: Response,
) => {
  const { name, email, password } = req.body;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ name }, { email }],
    },
  });

  if (existingUser) {
    throw createHttpError(409, "Username or email already taken");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
    },
  });

  const tokens = await createTokens(user.id);
  setRefreshTokenCookie(res, tokens.refreshToken);

  logger.info({ id: user.id, email: user.email }, "User registration");

  res.status(201).json({
    accessToken: tokens.accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  });
};

export const login = async (req: Request<{}, {}, LoginBody>, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw createHttpError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw createHttpError(401, "Invalid credentials");
  }

  const tokens = await createTokens(user.id);
  setRefreshTokenCookie(res, tokens.refreshToken);

  logger.info({ id: user.id, email: user.email }, "User logging in");

  res.status(200).json({
    accessToken: tokens.accessToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
    },
  });
};

export const refresh = async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.refreshToken ||
    (req.body as { refreshToken?: string })?.refreshToken;

  if (!refreshToken) {
    throw createHttpError(401, "Refresh token not provided");
  }

  const storedToken = await prisma.refreshToken.findFirst({
    where: { token: refreshToken },
  });

  if (!storedToken) {
    throw createHttpError(401, "Invalid refresh token");
  }

  await prisma.refreshToken.deleteMany({
    where: { id: storedToken.id },
  });

  if (new Date() > storedToken.expiresAt) {
    throw createHttpError(401, "Refresh token expired");
  }

  const tokens = await createTokens(storedToken.userId);
  setRefreshTokenCookie(res, tokens.refreshToken);

  res.status(200).json({
    accessToken: tokens.accessToken,
  });
};

export const logout = async (req: Request, res: Response) => {
  const refreshToken =
    req.cookies?.refreshToken ||
    (req.body as { refreshToken?: string })?.refreshToken;

  const userId = (req as any).user?.id;

  if (refreshToken) {
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  } else if (userId) {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  const isProduction = process.env.NODE_ENV === "production";

  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
  });

  res.status(204).end();
};

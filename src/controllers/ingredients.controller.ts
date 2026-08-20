import { Request, Response, NextFunction } from 'express';
import prisma from "../../prisma/client.ts";

export const getIngredients = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ingredients = await prisma.ingredient.findMany();
    res.status(200).json(ingredients);
  } catch (error) {
    next(error);
  }
};
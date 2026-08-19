import { Request, Response, NextFunction } from 'express';
import { getAllCategories } from "../services/categories.ts";

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await getAllCategories();
    res.status(200).json(categories);
  } catch (error) {
    next(error);
  }
};
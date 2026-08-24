import type { Request, Response } from "express";
import prisma from "../../prisma/client.ts";

// GET /api/categories -> [{ id, name, img }]
export const getCategories = async (_req: Request, res: Response) => {
  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true, img: true },
  });

  res.status(200).json(categories);
};

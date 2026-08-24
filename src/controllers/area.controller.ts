import type { Request, Response } from 'express';

import prisma from '../../prisma/client.ts';

export const getAllAreasController = async (_req: Request, res: Response) => {
  const areas = await prisma.area.findMany({
    orderBy: {
      name: 'asc',
    },
  });

  res.status(200).json({
    status: 200,
    data: areas,
  });
};

export const getAreaByIdController = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const area = await prisma.area.findUnique({
    where: {
      id,
    },
  });

  if (!area) {
    res.status(404).json({
      status: 404,
      message: 'Area not found',
    });

    return;
  }

  res.status(200).json({
    status: 200,
    data: area,
  });
};

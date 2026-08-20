import type { Request, Response } from 'express';

import { getAllAreas, getAreaById } from '../services/area.service.ts';

export const getAllAreasController = async (_req: Request, res: Response) => {
  const areas = await getAllAreas();

  res.status(200).json({
    status: 200,
    data: areas,
  });
};

export const getAreaByIdController = async (req: Request, res: Response) => {
  const id = req.params.id as string;

  const area = await getAreaById(id);

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

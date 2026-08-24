import type { Request, Response } from 'express';

import prisma from '../../prisma/client.ts';

export const getAllTestimonialsController = async (
  _req: Request,
  res: Response,
) => {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: {
      id: 'asc',
    },
    select: {
      id: true,
      testimonial: true,
      owner: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  res.status(200).json({
    status: 200,
    data: testimonials,
  });
};

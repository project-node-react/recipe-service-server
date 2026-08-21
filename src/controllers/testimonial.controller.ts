import type { Request, Response } from 'express';

import { getAllTestimonials } from '../services/testimonial.service.ts';

export const getAllTestimonialsController = async (
  _req: Request,
  res: Response,
) => {
  const testimonials = await getAllTestimonials();

  res.status(200).json({
    status: 200,
    data: testimonials,
  });
};

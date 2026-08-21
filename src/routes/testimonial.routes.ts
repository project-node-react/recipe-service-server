import { Router } from 'express';

import { getAllTestimonialsController } from '../controllers/testimonial.controller.ts';

const router = Router();

router.get('/', getAllTestimonialsController);

export default router;

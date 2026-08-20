import { Router } from 'express';

import {
  getAllAreasController,
  getAreaByIdController,
} from '../controllers/area.controller.ts';

const router = Router();

router.get('/', getAllAreasController);

router.get('/:id', getAreaByIdController);

export default router;

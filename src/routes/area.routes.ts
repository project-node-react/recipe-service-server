import { Router } from 'express';

import '../openapiParts/area.openapi.ts';

import {
  getAllAreasController,
  getAreaByIdController,
} from '../controllers/area.controller.ts';

const router = Router();

router.get('/', getAllAreasController);

router.get('/:id', getAreaByIdController);

export default router;

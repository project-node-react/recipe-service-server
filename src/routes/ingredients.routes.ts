import { Router } from 'express';

import "../validators/categories.validator.ts";
import { getIngredients } from '../controllers/ingredients.controller.ts';

const router = Router();
router.get('/', getIngredients);

export default router;
import { Router } from 'express';
import authenticate from '../middleware/authenticate.ts';
import { validateParams, validateQuery, validateBody } from '../middleware/validate.ts';
import { upload } from '../middleware/upload.ts';
import { IdParamsSchema, PaginationQuerySchema } from '../validators/common.validator.ts';
import {
  RecipesQuerySchema,
  PopularQuerySchema,
  CreateRecipeSchema,
} from '../validators/recipe.validator.ts';
import {
  getRecipes,
  getPopularRecipes,
  getRecipeById,
  getOwnRecipes,
  createRecipe,
  deleteRecipe,
  getFavoriteRecipes,
  addFavorite,
  removeFavorite,
} from '../controllers/recipe.controller.ts';

const router = Router();

// --- публичные ---
router.get('/', validateQuery(RecipesQuerySchema), getRecipes);
router.get('/popular', validateQuery(PopularQuerySchema), getPopularRecipes);

// --- приватные (порядок важен: конкретные пути раньше "/:id") ---
router.get('/own', authenticate, validateQuery(PaginationQuerySchema), getOwnRecipes);
router.get('/favorites', authenticate, validateQuery(PaginationQuerySchema), getFavoriteRecipes);
router.post(
  '/',
  authenticate,
  upload.single('thumb'),
  validateBody(CreateRecipeSchema),
  createRecipe,
);
router.post('/:id/favorite', authenticate, validateParams(IdParamsSchema), addFavorite);
router.delete('/:id/favorite', authenticate, validateParams(IdParamsSchema), removeFavorite);
router.delete('/:id', authenticate, validateParams(IdParamsSchema), deleteRecipe);

// --- публичный, должен идти после специфичных приватных путей выше ---
router.get('/:id', validateParams(IdParamsSchema), getRecipeById);

export default router;

import { z } from 'zod';
import { registry } from '../openapi.ts';
import { PaginationQuerySchema, IdParamsSchema } from './common.validator.ts';

// --- query params ---

export const RecipesQuerySchema = PaginationQuerySchema.extend({
  category: z.string().trim().optional().openapi({
    example: '6462a6cd4c3d0ddd28897f8a',
    description: 'Category id to filter by',
  }),
  ingredient: z.string().trim().optional().openapi({
    example: '640c2dd963a319ea671e37aa',
    description: 'Ingredient id to filter by',
  }),
  area: z.string().trim().optional().openapi({
    example: '6462a6f04c3d0ddd28897f9b',
    description: 'Area id to filter by',
  }),
});
export type RecipesQuery = z.infer<typeof RecipesQuerySchema>;

export const PopularQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(20).default(4).openapi({ example: 4 }),
});
export type PopularQuery = z.infer<typeof PopularQuerySchema>;

const IngredientInputSchema = z.object({
  id: z.string().min(1, 'ingredient id is required').openapi({
    example: '640c2dd963a319ea671e37aa',
  }),
  measure: z.string().trim().min(1, 'measure is required').openapi({ example: '200g' }),
});

// multipart/form-data приходит как строки, поэтому ingredients ожидаем как
// JSON-строку вида '[{"id":"...","measure":"..."}]' и парсим её через preprocess.
export const CreateRecipeSchema = registry.register(
  'CreateRecipe',
  z.object({
    title: z.string().trim().min(1).max(200).openapi({ example: 'Borscht' }),
    description: z.string().trim().max(500).optional().openapi({
      example: 'Classic Ukrainian beet soup',
    }),
    instructions: z.string().trim().min(1).openapi({
      example: 'Boil beets, sauté vegetables, combine and simmer for 40 minutes.',
    }),
    category: z.string().min(1, 'category id is required').openapi({
      example: '6462a6cd4c3d0ddd28897f8a',
      description: 'Category id',
    }),
    area: z.string().min(1, 'area id is required').openapi({
      example: '6462a6f04c3d0ddd28897f9b',
      description: 'Area id',
    }),
    time: z.coerce.number().int().min(1, 'cooking time must be at least 1 minute').openapi({
      example: 60,
      description: 'Cooking time in minutes',
    }),
    ingredients: z.preprocess(
      (val) => {
        if (typeof val === 'string') {
          try {
            return JSON.parse(val);
          } catch {
            return val;
          }
        }
        return val;
      },
      z.array(IngredientInputSchema).min(1, 'at least one ingredient is required'),
    ).openapi({
      example: [
        { id: '640c2dd963a319ea671e37aa', measure: '200g' },
        { id: '640c2dd963a319ea671e37f5', measure: '1 head' },
      ],
      description:
        'JSON-encoded string in multipart/form-data: \'[{"id":"...","measure":"..."}]\'',
    }),
    thumb: z.any().optional().openapi({
      type: 'string',
      format: 'binary',
      description: 'Recipe photo (multipart file field)',
    }),
  }),
);
export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;

// --- response shapes (for Swagger examples only) ---

const CategoryRefSchema = registry.register(
  'CategoryRef',
  z.object({
    id: z.string().openapi({ example: '6462a6cd4c3d0ddd28897f8a' }),
    name: z.string().openapi({ example: 'Soup' }),
  }),
);

const AreaRefSchema = registry.register(
  'AreaRef',
  z.object({
    id: z.string().openapi({ example: '6462a6f04c3d0ddd28897f9b' }),
    name: z.string().openapi({ example: 'Ukrainian' }),
  }),
);

const OwnerRefSchema = registry.register(
  'OwnerRef',
  z.object({
    id: z.string().openapi({ example: '64c8d958249fae54bae90bb9' }),
    name: z.string().openapi({ example: 'Vitalii' }),
    avatar: z.string().nullable().openapi({ example: null }),
  }),
);

const RecipeCardSchema = registry.register(
  'RecipeCard',
  z.object({
    id: z.string().openapi({ example: 'a1b2c3d4-e5f6-4789-9abc-def012345678' }),
    title: z.string().openapi({ example: 'Borscht' }),
    description: z.string().nullable().openapi({ example: 'Classic Ukrainian beet soup' }),
    thumb: z.string().nullable().openapi({
      example: 'https://res.cloudinary.com/demo/image/upload/foodies/recipes/borscht.jpg',
    }),
    cookingTime: z.number().openapi({ example: 60 }),
    category: CategoryRefSchema,
    area: AreaRefSchema,
    owner: OwnerRefSchema,
  }),
);

const PaginatedRecipesSchema = registry.register(
  'PaginatedRecipes',
  z.object({
    page: z.number().openapi({ example: 1 }),
    limit: z.number().openapi({ example: 12 }),
    totalItems: z.number().openapi({ example: 42 }),
    totalPages: z.number().openapi({ example: 4 }),
    data: z.array(RecipeCardSchema),
  }),
);

const RecipeIngredientRefSchema = registry.register(
  'RecipeIngredientRef',
  z.object({
    id: z.string().openapi({ example: '640c2dd963a319ea671e37aa' }),
    name: z.string().openapi({ example: 'Beet' }),
    img: z.string().nullable().openapi({ example: 'https://example.com/beet.png' }),
    measure: z.string().openapi({ example: '200g' }),
  }),
);

const RecipeDetailSchema = registry.register(
  'RecipeDetail',
  z.object({
    id: z.string().openapi({ example: 'a1b2c3d4-e5f6-4789-9abc-def012345678' }),
    title: z.string().openapi({ example: 'Borscht' }),
    description: z.string().nullable().openapi({ example: 'Classic Ukrainian beet soup' }),
    instructions: z.string().openapi({
      example: 'Boil beets, sauté vegetables, combine and simmer for 40 minutes.',
    }),
    thumb: z.string().nullable().openapi({
      example: 'https://res.cloudinary.com/demo/image/upload/foodies/recipes/borscht.jpg',
    }),
    preview: z.string().nullable().openapi({ example: null }),
    cookingTime: z.number().openapi({ example: 60 }),
    category: CategoryRefSchema,
    area: AreaRefSchema,
    owner: OwnerRefSchema,
    ingredients: z.array(RecipeIngredientRefSchema),
  }),
);

// --- paths ---

registry.registerPath({
  method: 'get',
  path: '/api/recipes',
  tags: ['Recipes'],
  summary: 'Search recipes (filters + pagination)',
  request: { query: RecipesQuerySchema },
  responses: {
    200: {
      description: 'Paginated list of recipes',
      content: { 'application/json': { schema: PaginatedRecipesSchema } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/recipes/popular',
  tags: ['Recipes'],
  summary: 'Most favorited recipes',
  request: { query: PopularQuerySchema },
  responses: {
    200: {
      description: 'List of popular recipes',
      content: { 'application/json': { schema: z.array(RecipeCardSchema) } },
    },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/recipes/own',
  tags: ['Recipes'],
  summary: "Get current authenticated user's own recipes",
  security: [{ bearerAuth: [] }],
  request: { query: PaginationQuerySchema },
  responses: {
    200: {
      description: "Paginated list of the current user's recipes",
      content: { 'application/json': { schema: PaginatedRecipesSchema } },
    },
    401: { description: 'Authentication required' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/recipes/favorites',
  tags: ['Recipes'],
  summary: "Get current authenticated user's favorite recipes",
  security: [{ bearerAuth: [] }],
  request: { query: PaginationQuerySchema },
  responses: {
    200: {
      description: "Paginated list of the current user's favorite recipes",
      content: { 'application/json': { schema: PaginatedRecipesSchema } },
    },
    401: { description: 'Authentication required' },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/recipes/{id}',
  tags: ['Recipes'],
  summary: 'Get recipe details by id',
  request: { params: IdParamsSchema },
  responses: {
    200: {
      description: 'Recipe details',
      content: { 'application/json': { schema: RecipeDetailSchema } },
    },
    404: { description: 'Recipe not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/recipes',
  tags: ['Recipes'],
  summary: 'Create a new recipe',
  security: [{ bearerAuth: [] }],
  request: {
    body: {
      content: { 'multipart/form-data': { schema: CreateRecipeSchema } },
    },
  },
  responses: {
    201: { description: 'Recipe created' },
    400: { description: 'Unknown category/area/ingredient id' },
    401: { description: 'Authentication required' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/recipes/{id}',
  tags: ['Recipes'],
  summary: 'Delete own recipe',
  security: [{ bearerAuth: [] }],
  request: { params: IdParamsSchema },
  responses: {
    204: { description: 'Recipe deleted' },
    403: { description: 'You can only delete your own recipes' },
    404: { description: 'Recipe not found' },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/recipes/{id}/favorite',
  tags: ['Recipes'],
  summary: 'Add a recipe to favorites',
  security: [{ bearerAuth: [] }],
  request: { params: IdParamsSchema },
  responses: {
    204: { description: 'Added to favorites' },
    404: { description: 'Recipe not found' },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/recipes/{id}/favorite',
  tags: ['Recipes'],
  summary: 'Remove a recipe from favorites',
  security: [{ bearerAuth: [] }],
  request: { params: IdParamsSchema },
  responses: {
    204: { description: 'Removed from favorites' },
  },
});

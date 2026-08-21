import { z } from "zod";
import { registry } from "../openapi.ts";
import { PaginationQuerySchema } from "./common.validator.ts";

export const RecipesQuerySchema = PaginationQuerySchema.extend({
	category: z.string().trim().optional(),
	ingredient: z.string().trim().optional(),
	area: z.string().trim().optional(),
});
export type RecipesQuery = z.infer<typeof RecipesQuerySchema>;

export const PopularQuerySchema = z.object({
	limit: z.coerce.number().int().min(1).max(20).default(4),
});
export type PopularQuery = z.infer<typeof PopularQuerySchema>;

const IngredientInputSchema = z.object({
	id: z.string().min(1, "ingredient id is required"),
	measure: z.string().trim().min(1, "measure is required"),
});

// multipart/form-data приходит как строки, поэтому ingredients ожидаем как
// JSON-строку вида '[{"id":"...","measure":"..."}]' и парсим её через preprocess.
export const CreateRecipeSchema = registry.register(
	"CreateRecipe",
	z.object({
		title: z.string().trim().min(1).max(200).openapi({ example: "Borscht" }),
		description: z.string().trim().max(500).optional(),
		instructions: z.string().trim().min(1),
		category: z.string().min(1, "category id is required"),
		area: z.string().min(1, "area id is required"),
		time: z.coerce
			.number()
			.int()
			.min(1, "cooking time must be at least 1 minute"),
		ingredients: z.preprocess(
			(val) => {
				if (typeof val === "string") {
					try {
						return JSON.parse(val);
					} catch {
						return val;
					}
				}
				return val;
			},
			z
				.array(IngredientInputSchema)
				.min(1, "at least one ingredient is required"),
		),
	}),
);
export type CreateRecipeBody = z.infer<typeof CreateRecipeSchema>;

// --- shared response building blocks ---

const CategoryRefSchema = z.object({
	id: z.string().openapi({ example: "cat-borscht" }),
	name: z.string().openapi({ example: "Soup" }),
});

const AreaRefSchema = z.object({
	id: z.string().openapi({ example: "area-ukrainian" }),
	name: z.string().openapi({ example: "Ukrainian" }),
});

const OwnerRefSchema = z.object({
	id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
	name: z.string().openapi({ example: "ivan_petrenko" }),
	avatar: z.string().nullable().openapi({
		example:
			"https://res.cloudinary.com/dzxdn99qc/image/upload/v1786188885/avatars/nnzjc2gtqrawrmifzv4w.jpg",
	}),
});

export const RecipeCardSchema = registry.register(
	"RecipeCard",
	z.object({
		id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
		title: z.string().openapi({ example: "Borscht" }),
		description: z
			.string()
			.nullable()
			.openapi({ example: "Traditional Ukrainian beet soup" }),
		thumb: z.string().nullable().openapi({
			example:
				"https://res.cloudinary.com/dzxdn99qc/image/upload/v1/recipes/borscht.jpg",
		}),
		cookingTime: z.number().int().openapi({ example: 60 }),
		category: CategoryRefSchema,
		area: AreaRefSchema,
		owner: OwnerRefSchema,
	}),
);

const paginatedResponse = (dataSchema: z.ZodTypeAny) =>
	z.object({
		page: z.number().int().openapi({ example: 1 }),
		limit: z.number().int().openapi({ example: 12 }),
		totalItems: z.number().int().openapi({ example: 42 }),
		totalPages: z.number().int().openapi({ example: 4 }),
		data: z.array(dataSchema),
	});

export const RecipeIngredientSchema = registry.register(
	"RecipeIngredient",
	z.object({
		id: z.string().openapi({ example: "ing-beetroot" }),
		name: z.string().openapi({ example: "Beetroot" }),
		img: z.string().nullable().openapi({
			example:
				"https://res.cloudinary.com/dzxdn99qc/image/upload/v1/ingredients/beetroot.jpg",
		}),
		measure: z.string().openapi({ example: "2 pcs" }),
	}),
);

export const RecipeDetailSchema = registry.register(
	"RecipeDetail",
	z.object({
		id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
		title: z.string().openapi({ example: "Borscht" }),
		description: z.string().nullable(),
		instructions: z
			.string()
			.openapi({ example: "Boil the beets, chop the vegetables..." }),
		thumb: z.string().nullable(),
		preview: z.string().nullable(),
		cookingTime: z.number().int().openapi({ example: 60 }),
		category: CategoryRefSchema,
		area: AreaRefSchema,
		owner: OwnerRefSchema,
		ingredients: z.array(RecipeIngredientSchema),
	}),
);

export const PopularRecipeSchema = registry.register(
	"PopularRecipe",
	RecipeCardSchema.extend({
		favoritesCount: z.number().int().openapi({ example: 128 }),
	}),
);

const ErrorSchema = z.object({ error: z.string() });

// --- paths ---

registry.registerPath({
	method: "get",
	path: "/api/recipes",
	tags: ["Recipes"],
	summary: "Search recipes (filters + pagination)",
	request: { query: RecipesQuerySchema },
	responses: {
		200: {
			description: "Paginated list of recipes",
			content: {
				"application/json": { schema: paginatedResponse(RecipeCardSchema) },
			},
		},
		422: { description: "Validation error" },
	},
});

registry.registerPath({
	method: "get",
	path: "/api/recipes/popular",
	tags: ["Recipes"],
	summary: "Most favorited recipes",
	request: { query: PopularQuerySchema },
	responses: {
		200: {
			description: "List of popular recipes, ordered by favorites count",
			content: { "application/json": { schema: z.array(PopularRecipeSchema) } },
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/recipes/own",
	tags: ["Recipes"],
	summary: "Get the authenticated user's own recipes",
	security: [{ bearerAuth: [] }],
	request: { query: PaginationQuerySchema },
	responses: {
		200: {
			description: "Paginated list of the current user recipes",
			content: {
				"application/json": { schema: paginatedResponse(RecipeCardSchema) },
			},
		},
		401: {
			description: "Authentication required",
			content: { "application/json": { schema: ErrorSchema } },
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/recipes/favorites",
	tags: ["Recipes"],
	summary: "Get the authenticated user's favorite recipes",
	security: [{ bearerAuth: [] }],
	request: { query: PaginationQuerySchema },
	responses: {
		200: {
			description: "Paginated list of favorite recipes",
			content: {
				"application/json": { schema: paginatedResponse(RecipeCardSchema) },
			},
		},
		401: {
			description: "Authentication required",
			content: { "application/json": { schema: ErrorSchema } },
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/recipes/{id}",
	tags: ["Recipes"],
	summary: "Get recipe details by id",
	request: {
		params: z.object({
			id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
		}),
	},
	responses: {
		200: {
			description: "Recipe details",
			content: { "application/json": { schema: RecipeDetailSchema } },
		},
		404: {
			description: "Recipe not found",
			content: { "application/json": { schema: ErrorSchema } },
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/recipes",
	tags: ["Recipes"],
	summary: "Create a new recipe",
	description:
		'Multipart form data. `ingredients` must be sent as a JSON-encoded string, e.g. \'[{"id":"ing-beetroot","measure":"2 pcs"}]\'. `thumb` is an optional image file.',
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: { "multipart/form-data": { schema: CreateRecipeSchema } },
		},
	},
	responses: {
		201: { description: "Recipe created" },
		400: {
			description: "Unknown category/area/ingredient id",
			content: { "application/json": { schema: ErrorSchema } },
		},
		401: {
			description: "Authentication required",
			content: { "application/json": { schema: ErrorSchema } },
		},
		422: { description: "Validation error" },
	},
});

registry.registerPath({
	method: "delete",
	path: "/api/recipes/{id}",
	tags: ["Recipes"],
	summary: "Delete own recipe",
	security: [{ bearerAuth: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
		}),
	},
	responses: {
		204: { description: "Recipe deleted" },
		401: {
			description: "Authentication required",
			content: { "application/json": { schema: ErrorSchema } },
		},
		403: {
			description: "You can only delete your own recipes",
			content: { "application/json": { schema: ErrorSchema } },
		},
		404: {
			description: "Recipe not found",
			content: { "application/json": { schema: ErrorSchema } },
		},
	},
});

registry.registerPath({
	method: "post",
	path: "/api/recipes/{id}/favorite",
	tags: ["Recipes"],
	summary: "Add a recipe to favorites",
	security: [{ bearerAuth: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
		}),
	},
	responses: {
		204: { description: "Recipe added to favorites (idempotent)" },
		401: {
			description: "Authentication required",
			content: { "application/json": { schema: ErrorSchema } },
		},
		404: {
			description: "Recipe not found",
			content: { "application/json": { schema: ErrorSchema } },
		},
	},
});

registry.registerPath({
	method: "delete",
	path: "/api/recipes/{id}/favorite",
	tags: ["Recipes"],
	summary: "Remove a recipe from favorites",
	security: [{ bearerAuth: [] }],
	request: {
		params: z.object({
			id: z.string().openapi({ example: "64c8d958249fae54bae90bb9" }),
		}),
	},
	responses: {
		204: { description: "Recipe removed from favorites (idempotent)" },
		401: {
			description: "Authentication required",
			content: { "application/json": { schema: ErrorSchema } },
		},
	},
});

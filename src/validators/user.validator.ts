import { z } from "zod";
import { registry } from "../openapi.ts";

export const UserIdParamsSchema = registry.register(
	"UserIdParams",
	z.object({
		userId: z.string().openapi({
			example: "64c8d958249fae54bae90bb9",
			description: "ID of the user to fetch",
		}),
	}),
);

export type UserIdParams = z.infer<typeof UserIdParamsSchema>;

export const UserProfileResponseSchema = registry.register(
	"UserProfileResponse",
	z.object({
		id: z.string().openapi({
			example: "64c8d958249fae54bae90bb9",
		}),
		name: z.string().openapi({
			example: "ivan_petrenko",
		}),
		email: z.email().openapi({
			example: "ivan@example.com",
		}),
		avatar: z.string().nullable().openapi({
			example:
				"https://res.cloudinary.com/dzxdn99qc/image/upload/v1786188885/avatars/nnzjc2gtqrawrmifzv4w.jpg",
		}),
		recipesCount: z.number().int().min(0).openapi({
			example: 42,
			description: "Number of recipes created by the user",
		}),
		followersCount: z.number().int().min(0).openapi({
			example: 127,
			description: "Number of followers the user has",
		}),
		createdAt: z.iso.datetime().openapi({
			example: "2025-01-10T12:00:00.000Z",
		}),
	}),
);

export type UserProfileResponse = z.infer<typeof UserProfileResponseSchema>;

export const CurrentUserResponseSchema = registry.register(
	"CurrentUserResponse",
	z.object({
		id: z.string().openapi({
			example: "64c8d958249fae54bae90bb9",
		}),
		name: z.string().openapi({
			example: "ivan_petrenko",
		}),
		email: z.email().openapi({
			example: "ivan@example.com",
		}),
		avatar: z.string().nullable().openapi({
			example:
				"https://res.cloudinary.com/dzxdn99qc/image/upload/v1786188885/avatars/nnzjc2gtqrawrmifzv4w.jpg",
		}),
		recipesCount: z.number().int().min(0).openapi({
			example: 42,
			description: "Number of recipes created by the current user",
		}),
		favoritesCount: z.number().int().min(0).openapi({
			example: 15,
			description: "Number of recipes favorited by the current user",
		}),
		followersCount: z.number().int().min(0).openapi({
			example: 127,
			description: "Number of followers of the current user",
		}),
		followingCount: z.number().int().min(0).openapi({
			example: 34,
			description: "Number of users the current user follows",
		}),
	}),
);

export type CurrentUserResponse = z.infer<typeof CurrentUserResponseSchema>;

registry.registerPath({
	method: "get",
	path: "/api/users/current",
	tags: ["Users"],
	summary: "Get current user info",
	description:
		"Private endpoint. Returns avatar, name, email and counters (own recipes, favorites, followers, following) for the authenticated user",
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description: "Current user info",
			content: {
				"application/json": {
					schema: CurrentUserResponseSchema,
				},
			},
		},
		401: {
			description: "Authentication required or invalid token",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string(),
					}),
				},
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/users/{userId}",
	tags: ["Users"],
	summary: "Get user profile",
	description: "Get detailed information about a user by their ID",
	request: {
		params: UserIdParamsSchema,
	},
	responses: {
		200: {
			description: "User profile",
			content: {
				"application/json": {
					schema: UserProfileResponseSchema,
				},
			},
		},
		404: {
			description: "User not found",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string(),
					}),
				},
			},
		},
	},
});

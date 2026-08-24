import { z } from "zod";
import { registry } from "../openapi.ts";
import { PaginationQuerySchema } from "./common.validator.ts";
import { PaginatedRecipesSchema } from "./recipe.validator.ts";

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
	security: [{ bearerAuth: [] }],
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

registry.registerPath({
	method: "get",
	path: "/api/users/{userId}/recipes",
	tags: ["Users"],
	summary: "Get recipes created by a user",
	description:
		"Private endpoint. Returns a paginated list of recipes owned by the specified user.",
	security: [{ bearerAuth: [] }],
	request: {
		params: UserIdParamsSchema,
		query: PaginationQuerySchema,
	},
	responses: {
		200: {
			description: "Paginated list of the user's recipes",
			content: {
				"application/json": {
					schema: PaginatedRecipesSchema,
				},
			},
		},
		400: {
			description: "Invalid user ID or pagination parameters",
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
		404: {
			description: "User not found",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string().openapi({ example: "User not found" }),
					}),
				},
			},
		},
	},
});
export const FollowersResponseSchema = registry.register(
	"FollowersResponse",
	z.object({
		followers: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				avatar: z.string().nullable(),
			}),
		),
	}),
);

export type FollowersResponse = z.infer<typeof FollowersResponseSchema>;

registry.registerPath({
	method: "get",
	path: "/api/users/{userId}/followers",
	tags: ["Users"],
	summary: "Get user's followers",
	description: "Get users who follow the specified user",
	security: [{ bearerAuth: [] }],
	request: {
		params: UserIdParamsSchema,
	},
	responses: {
		200: {
			description: "List of followers",
			content: {
				"application/json": {
					schema: FollowersResponseSchema,
				},
			},
		},
		401: {
			description: "Authentication required",
		},
		404: {
			description: "User not found",
		},
	},
});
export const FollowingResponseSchema = registry.register(
	"FollowingResponse",
	z.object({
		following: z.array(
			z.object({
				id: z.string(),
				name: z.string(),
				avatar: z.string().nullable(),
			}),
		),
	}),
);

export type FollowingResponse = z.infer<typeof FollowingResponseSchema>;

registry.registerPath({
	method: "get",
	path: "/api/users/following",
	tags: ["Users"],
	summary: "Get users followed by authenticated user",
	description: "Get users that the authenticated user follows",
	security: [{ bearerAuth: [] }],
	responses: {
		200: {
			description: "List of followed users",
			content: {
				"application/json": {
					schema: FollowingResponseSchema,
				},
			},
		},
		401: {
			description: "Authentication required",
		},
	},
});
registry.registerPath({
	method: "post",
	path: "/api/users/{userId}/follow",
	tags: ["Users"],
	summary: "Follow a user",
	description: "Add a user to the authenticated user's following list",
	security: [{ bearerAuth: [] }],
	request: {
		params: UserIdParamsSchema,
	},
	responses: {
		201: {
			description: "User followed successfully",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string().openapi({
							example: "User followed successfully",
						}),
					}),
				},
			},
		},
		400: {
			description: "Cannot follow yourself",
		},
		401: {
			description: "Authentication required",
		},
		404: {
			description: "User not found",
		},
		409: {
			description: "Already following this user",
		},
	},
});
registry.registerPath({
	method: "delete",
	path: "/api/users/{userId}/follow",
	tags: ["Users"],
	summary: "Unfollow a user",
	description: "Remove a user from the authenticated user's following list",
	security: [{ bearerAuth: [] }],
	request: {
		params: UserIdParamsSchema,
	},
	responses: {
		200: {
			description: "User unfollowed successfully",
			content: {
				"application/json": {
					schema: z.object({
						message: z.string().openapi({
							example: "User unfollowed successfully",
						}),
					}),
				},
			},
		},
		401: {
			description: "Authentication required",
		},
		404: {
			description: "You are not following this user",
		},
	},
});

export const UpdateAvatarResponseSchema = registry.register(
	"UpdateAvatarResponse",
	z.object({
		avatar: z.string().url().openapi({
			example:
				"https://res.cloudinary.com/dzxdn99qc/image/upload/v1786188885/avatars/nnzjc2gtqrawrmifzv4w.jpg",
			description: "URL оновленого зображення профілю",
		}),
	}),
);

export type UpdateAvatarResponse = z.infer<typeof UpdateAvatarResponseSchema>;

registry.registerPath({
	method: "patch", // Або "put", залежно від вашого роутера
	path: "/api/users/avatar",
	tags: ["Users"],
	summary: "Update user avatar",
	description:
		"Private endpoint. Uploads a new avatar image using multipart/form-data (field name: 'avatar') and updates Cloudinary URL.",
	security: [{ bearerAuth: [] }],
	request: {
		body: {
			content: {
				"multipart/form-data": {
					schema: z.object({
						avatar: z.string().openapi({
							type: "string",
							format: "binary",
							description: "Image file to upload (JPEG, PNG, WebP, etc.)",
						}),
					}),
				},
			},
		},
	},
	responses: {
		200: {
			description: "Avatar updated successfully",
			content: {
				"application/json": {
					schema: UpdateAvatarResponseSchema,
				},
			},
		},
		400: {
			description: "Bad Request — file missing or invalid format",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string().openapi({ example: "Avatar file is required" }),
					}),
				},
			},
		},
		401: {
			description: "Authentication required or invalid token",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string().openapi({ example: "Authentication required" }),
					}),
				},
			},
		},
		500: {
			description: "Internal server error during upload",
			content: {
				"application/json": {
					schema: z.object({
						error: z.string().openapi({ example: "Internal server error" }),
					}),
				},
			},
		},
	},
});

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

import { z } from "zod";
import { registry } from "../openapi.ts";

export const AreaSchema = registry.register(
	"Area",
	z.object({
		id: z.string().openapi({ example: "6462a6f04c3d0ddd28897fa5" }),
		name: z.string().openapi({ example: "American" }),
	}),
);

registry.registerPath({
	method: "get",
	path: "/api/areas",
	tags: ["Areas"],
	summary: "Get all areas",
	description:
		"Get a list of all cuisine areas. Note: this route is implemented " +
		"(area.routes.ts) but is not mounted in app.ts, so it is not reachable " +
		"on the running server yet.",
	responses: {
		200: {
			description: "List of all areas",
			content: {
				"application/json": {
					schema: z.object({
						status: z.number().openapi({ example: 200 }),
						data: z.array(AreaSchema),
					}),
				},
			},
		},
	},
});

registry.registerPath({
	method: "get",
	path: "/api/areas/{id}",
	tags: ["Areas"],
	summary: "Get area by id",
	description:
		"Get a single cuisine area by its id. Note: this route is implemented " +
		"(area.routes.ts) but is not mounted in app.ts, so it is not reachable " +
		"on the running server yet.",
	request: {
		params: z.object({
			id: z.string().openapi({ example: "6462a6f04c3d0ddd28897fa5" }),
		}),
	},
	responses: {
		200: {
			description: "Area found",
			content: {
				"application/json": {
					schema: z.object({
						status: z.number().openapi({ example: 200 }),
						data: AreaSchema,
					}),
				},
			},
		},
		404: {
			description: "Area not found",
			content: {
				"application/json": {
					schema: z.object({
						status: z.number().openapi({ example: 404 }),
						message: z.string().openapi({ example: "Area not found" }),
					}),
				},
			},
		},
	},
});

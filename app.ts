import express from "express";
import type { NextFunction, Request, Response } from "express";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";

import { generateOpenApiDocument } from "./src/openapi.ts";
import "./src/validators/area.validator.ts";
import "./src/validators/testimonial.validator.ts";
import areasRoutes from "./src/routes/area.routes.ts";
import testimonialRoutes from "./src/routes/testimonial.routes.ts";
import authRouter from "./src/routes/auth.routes.ts";
import userRouter from "./src/routes/user.routes.ts";
import recipesRouter from "./src/routes/recipe.routes.ts";
import categoriesRoutes from "./src/routes/categories.routes.ts";
import ingredientsRoutes from "./src/routes/ingredients.routes.ts";

import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

import logger from "./src/logger.ts";
import { pinoHttp } from "pino-http";

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
	? process.env.ALLOWED_ORIGINS.split(",").map((origin) => origin.trim())
	: ["http://localhost:5173"];

const authLimiter = rateLimit({
	windowMs: 15 * 60 * 1000,
	limit: 10,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: {
		error: "Too many requests, please try again later",
	},
});

app.use(pinoHttp({ logger }));

app.use(
	cors({
		origin: allowedOrigins,
		methods: ["GET", "POST", "PATCH", "DELETE"],
		allowedHeaders: ["Content-Type", "Authorization"],
		exposedHeaders: ["X-Total-Count"],
		credentials: true,
		maxAge: 86400,
	}),
);
app.use(
	helmet({
		contentSecurityPolicy: false,
	}),
);

app.use(express.json());
app.use(cookieParser());
const openApiDocument = generateOpenApiDocument();
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use("/api/auth", authLimiter, authRouter);
app.use("/api/users", userRouter);
app.use("/api/recipes", recipesRouter);

app.use("/api/areas", areasRoutes);

app.use("/api/testimonials", testimonialRoutes);
// Add the categories routes
app.use("/api/categories", categoriesRoutes);

// ingredients routes
app.use("/api/ingredients", ingredientsRoutes);

// 404 Not Found handler - must be after all routes
app.use((_req: Request, res: Response) => {
	res.status(404).json({ error: "Not found" });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
	console.error(err);

	if (err.type === "entity.parse.failed") {
		return res.status(400).json({
			error: "Validation failed",
			details: {
				body: ["Invalid JSON format in request body"],
			},
		});
	}

	if (err.status && err.status >= 400 && err.status < 500) {
		return res.status(err.status).json({ error: err.message });
	}

	if (err.code === "P2025") {
		return res.status(404).json({ error: "Resource not found" });
	}

	if (err.code === "P2002") {
		return res.status(409).json({ error: "Unique constraint violation" });
	}

	if (err.code === "P2003") {
		return res.status(400).json({ error: "Foreign key constraint failed" });
	}

	res.status(500).json({ error: "Internal server error" });
});

export default app;

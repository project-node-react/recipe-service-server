import { Router } from "express";
import type { Request, Response } from "express";

const rootRouter = Router();

/**
 * GET /
 * Redirects browser requests to Swagger UI, or returns JSON status for API clients/health checks.
 */
rootRouter.get("/", (req: Request, res: Response) => {
	if (req.accepts("html")) {
		return res.redirect("/api-docs");
	}

	return res.status(200).json({
		status: "ok",
		message: "Recipe Service API is running",
		documentation: "/api-docs",
	});
});

export default rootRouter;

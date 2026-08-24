import { Router } from "express";
import { getTestimonials } from "../controllers/testimonial.controller.ts";

const router = Router();

router.get("/", getTestimonials);

export default router;

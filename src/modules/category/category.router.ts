import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { categoriesController } from "./category.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR, UserRole.ADMIN),
  categoriesController.createCategory,
);
router.get(
  "/",
  categoriesController.getAllCategories,
);

export const categoriesRouter = router;

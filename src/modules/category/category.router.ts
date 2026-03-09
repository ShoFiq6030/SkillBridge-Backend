import express, { Router } from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { categoriesController } from "./category.controller";

const router = express.Router();

router.post(
  "/",
  auth(UserRole.TUTOR, UserRole.ADMIN),
  categoriesController.createCategory,
);
router.get("/", categoriesController.getAllCategories);
router.put("/:id", auth(UserRole.ADMIN), categoriesController.updateCategory);

export const categoriesRouter = router;

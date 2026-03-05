import { Category } from "../../../generated/prisma";
import { prisma } from "../../lib/prisma";

const createCategory = async (categoryData: Category) => {
  try {
    const { name, slug } = categoryData;
    const existingCategory = await prisma.category.findUnique({
      where: { name, slug },
    });
    if (existingCategory) {
      return {
        success: false,
        error: "Category with this name and slug already exists",
      };
    }
    const category = await prisma.category.create({
      data: {
        name,
        slug,
      },
    });
    if (!category) {
      return {
        success: false,
        error: "Failed to create category",
      };
    }
    return {
      success: true,
      data: category,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: (error as Error).message || "Failed to create category",
    };
  }
};

const getAllCategories = async () => {
  try {
    const categories = await prisma.category.findMany();
    return categories;
  } catch (error) {
    console.log(error);
    throw new Error((error as Error).message || "Failed to fetch categories");
  }
};

export const categoriesService = {
  createCategory,
  getAllCategories,
};

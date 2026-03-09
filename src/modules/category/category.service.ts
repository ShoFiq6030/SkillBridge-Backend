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

const updateCategory = async (id: string, categoryData: Partial<Category>) => {
  try {
    const { name, slug } = categoryData;

    // Check if category exists
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });
    if (!existingCategory) {
      return {
        success: false,
        error: "Category not found",
      };
    }

    // Check for uniqueness if name or slug is being updated
    if (name || slug) {
      const duplicateCheck = await prisma.category.findFirst({
        where: {
          OR: [
            name ? { name, id: { not: id } } : {},
            slug ? { slug, id: { not: id } } : {},
          ].filter(condition => Object.keys(condition).length > 0),
        },
      });
      if (duplicateCheck) {
        return {
          success: false,
          error: "Category with this name or slug already exists",
        };
      }
    }

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug && { slug }),
      },
    });

    return {
      success: true,
      data: updatedCategory,
    };
  } catch (error) {
    console.log(error);
    return {
      success: false,
      error: (error as Error).message || "Failed to update category",
    };
  }
};

export const categoriesService = {
  createCategory,
  getAllCategories,
  updateCategory,
};

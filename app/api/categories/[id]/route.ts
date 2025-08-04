import dbConnect from "@/lib/dbConnection";
import {Tool, Category} from "@/app/Models/Tools";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
  isActive: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateCategorySchema.safeParse(body);
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Validation failed", 
          details: validation.error.issues 
        }, 
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if category exists
    const existingCategory = await Category.findById(id);
    if (!existingCategory) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if name is already taken by another category
    if (validation.data.name !== existingCategory.name) {
      const duplicateCategory = await Category.findOne({ 
        name: validation.data.name,
        _id: { $ne: id }
      });
      if (duplicateCategory) {
        return NextResponse.json(
          { error: "Category name already exists" },
          { status: 409 }
        );
      }
    }

    // Update the category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    );

    return NextResponse.json({
      id: updatedCategory._id,
      name: updatedCategory.name,
      isActive: updatedCategory.isActive,
    });
  } catch (error) {
    console.error("Failed to update category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    // Check if category is being used by any tools
    const toolsUsingCategory = await Tool.countDocuments({ category: id });
    if (toolsUsingCategory > 0) {
      return NextResponse.json(
        { 
          error: `Cannot delete category. ${toolsUsingCategory} tool(s) are using this category.` 
        },
        { status: 409 }
      );
    }

    // Delete the category
    await Category.findByIdAndDelete(id);

    return NextResponse.json({ message: "Category deleted successfully" });
  } catch (error) {
    console.error("Failed to delete category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
} 
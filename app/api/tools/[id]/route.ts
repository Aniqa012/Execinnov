import dbConnect from "@/lib/dbConnection";
import {Tool, Category} from "@/app/Models/Tools";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { ToolLean, QuestionLean } from "@/lib/types";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required").trim(),
  answer: z.string().optional().default(""),
  maxAnsLength: z.number().min(1).max(5000).default(600),
});

const updateToolSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  systemInstructions: z.string().min(1, "System instructions are required").trim(),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
  isPro: z.boolean().default(false),
  isActive: z.boolean().default(true),
  category: z.string().min(1, "Category is required"),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await dbConnect();

    const tool = await Tool.findById(id)
      .populate("category", "name")
      .lean();

    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Serialize the data properly
    const toolData = tool as unknown as ToolLean;
    const serializedTool = {
      id: toolData._id.toString(),
      title: toolData.title,
      description: toolData.description,
      systemInstructions: toolData.systemInstructions,
      isPro: toolData.isPro,
      isActive: toolData.isActive,
      category: toolData.category ? {
        id: toolData.category._id.toString(),
        name: toolData.category.name
      } : null,
      questions: toolData.questions?.map((question) => {
        const q = question as unknown as QuestionLean;
        return {
          id: q._id?.toString(),
          question: q.question,
          answer: q.answer || "",
          maxAnsLength: q.maxAnsLength || 600
        };
      }) || [],
      createdAt: toolData.createdAt?.toISOString(),
      updatedAt: toolData.updatedAt?.toISOString()
    };

    return NextResponse.json(serializedTool);
  } catch (error) {
    console.error("Failed to fetch tool:", error);
    return NextResponse.json(
      { error: "Failed to fetch tool", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const validation = updateToolSchema.safeParse(body);
    
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

    // Check if tool exists
    const existingTool = await Tool.findById(id);
    if (!existingTool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Verify category exists
    const categoryExists = await Category.findById(validation.data.category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid category selected" },
        { status: 400 }
      );
    }

    // Update the tool
    const updatedTool = await Tool.findByIdAndUpdate(
      id,
      validation.data,
      { new: true, runValidators: true }
    ).populate('category', 'name');

    return NextResponse.json({
      id: updatedTool._id,
      title: updatedTool.title,
      description: updatedTool.description,
      category: updatedTool.category,
      questionsCount: updatedTool.questions.length,
      isPro: updatedTool.isPro,
      isActive: updatedTool.isActive,
    });
  } catch (error) {
    console.error("Failed to update tool:", error);
    return NextResponse.json(
      { error: "Failed to update tool" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();

    // Check if tool exists
    const { id } = await params;
    const tool = await Tool.findById(id);
    if (!tool) {
      return NextResponse.json(
        { error: "Tool not found" },
        { status: 404 }
      );
    }

    // Delete the tool
    await Tool.findByIdAndDelete(id);

    return NextResponse.json({ message: "Tool deleted successfully" });
  } catch (error) {
    console.error("Failed to delete tool:", error);
    return NextResponse.json(
      { error: "Failed to delete tool" },
      { status: 500 }
    );
  }
} 
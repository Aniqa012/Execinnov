import { auth } from "@/app/auth";
import { Category, Tool } from "@/app/Models/Tools";
import dbConnect from "@/lib/dbConnection";
import { ToolFilter, ToolLean } from "@/lib/types";
import { NextResponse } from "next/server";
import { z } from "zod";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required").trim(),
  answer: z.string().optional().default(""),
  maxAnsLength: z.number().min(1).max(5000).default(600),
});

const createToolSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  systemInstructions: z
    .string()
    .min(1, "System instructions are required")
    .trim(),
  questions: z
    .array(questionSchema)
    .min(1, "At least one question is required"),
  isPro: z.boolean().default(false),
  isActive: z.boolean().default(true),
  category: z.string().min(1, "Category is required"),
});

export const GET = auth(async function GET(req) {
  console.log("req.auth: ", req.auth);
  if (!req.auth?.user) {
    console.log("Unauthorized");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const page = searchParams.get("page") || "1";
    const limit = searchParams.get("limit") || "10";
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const pageNumber = parseInt(page);
    const limitNumber = parseInt(limit);
    const skip = (pageNumber - 1) * limitNumber;

    const isAdmin = req.auth.user.isAdmin;

    await dbConnect();

    // Build the filter query
    const filter: ToolFilter = {};

    if (!isAdmin) {
      // For non-admin users, filter by userId or documents without userId
      filter.$or = [
        { userId: req.auth.user.id, isActive: true },
        { userId: { $exists: false }, isActive: true }
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      if (isAdmin) {
        // For admin users, just add search conditions
        filter.$or = [
          { title: { $regex: search, $options: "i" }, isActive: true },
          { description: { $regex: search, $options: "i" }, isActive: true },
        ];
      } else {
        // For non-admin users, combine search with userId conditions
        filter.$or = [
          { userId: req.auth.user.id, isActive: true },
          { userId: { $exists: false }, isActive: true },
          { title: { $regex: search, $options: "i" }, isActive: true },
          { description: { $regex: search, $options: "i" }, isActive: true },
        ];
      }
    }

    // Get total count for pagination
    const totalTools = await Tool.countDocuments(filter);

    // Fetch tools with pagination
    const tools = await Tool.find(filter)
      .populate("category", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean();

    console.log("Tools: ", tools);
    // Serialize the data properly
    const serializedTools = tools.map((tool) => {
      const t = tool as unknown as ToolLean;
      return {
        id: t._id.toString(),
        title: t.title,
        description: t.description,
        isPro: t.isPro,
        isActive: t.isActive,
        systemInstructions: isAdmin ? t.systemInstructions : undefined,
        category: t.category
          ? {
              id: t.category._id.toString(),
              name: t.category.name,
            }
          : null,
        questionsCount: t.questions?.length || 0,
        createdAt: t.createdAt?.toISOString(),
        updatedAt: t.updatedAt?.toISOString(),
      };
    });

    const totalPages = Math.ceil(totalTools / limitNumber);
    const hasMore = pageNumber < totalPages;

    return NextResponse.json({
      tools: serializedTools,
      pagination: {
        currentPage: pageNumber,
        totalPages,
        totalTools,
        hasMore,
        limit: limitNumber,
      },
    });
  } catch (error) {
    console.error("Failed to fetch tools:", error);
    return NextResponse.json(
      { error: "Failed to fetch tools" },
      { status: 500 }
    );
  }
});

export const POST = auth(async function POST(req) {
  if (!req.auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const validation = createToolSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        {
          error: "Validation failed",
          details: validation.error.issues,
        },
        { status: 400 }
      );
    }

    await dbConnect();

    // Verify category exists
    const categoryExists = await Category.findById(validation.data.category);
    if (!categoryExists) {
      return NextResponse.json(
        { error: "Invalid category selected" },
        { status: 400 }
      );
    }

    // Create the tool
    const tool = await Tool.create({
      ...validation.data,
      userId: req.auth.user.id,
    });

    // Populate category for response
    await tool.populate("category", "name");

    return NextResponse.json(
      {
        id: tool._id,
        title: tool.title,
        description: tool.description,
        category: tool.category,
        questionsCount: tool.questions.length,
        isPro: tool.isPro,
        isActive: tool.isActive,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create tool:", error);
    return NextResponse.json(
      { error: "Failed to create tool" },
      { status: 500 }
    );
  }
});

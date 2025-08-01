import {  NextResponse } from "next/server";
import { Tool } from "@/app/Models/Tools";
import { z } from "zod";
import { generateResponse } from "@/app/services/agent";
import dbConnect from "@/lib/dbConnection";
import { auth } from "@/app/auth";
import Notification from "@/app/Models/Notification";

const questionSchema = z.object({
  question: z.string().min(1, 'Question is required'),
  answer: z.string().min(1, 'Answer is required'),
});

const requestSchema = z.object({
  toolId: z.string().min(1, 'Tool ID is required'),
  questions: z.array(questionSchema).min(1, 'At least one question is required'),
});

export const POST = auth(async function POST(req) {
  if(!req.auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const validation = requestSchema.safeParse(await req.json());


  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
  const { toolId, questions } = validation.data;
  try {
    await dbConnect();
    const tool = await Tool.findById(toolId);

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    const response = await generateResponse(tool.systemInstructions, questions, req.auth.user.name);

    // Create notification for AI completion
    await Notification.create({
      userId: req.auth.user.id,
      title: "AI Results Ready",
      message: `Your results for ${tool.title} are ready to view`,
      type: "ai_completion",
      link: `/tools/${toolId}`,
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "System Error Occured" },
      { status: 500 }
    );
  }
})

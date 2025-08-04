import { generateTool } from "@/app/services/agent";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const createToolRequestSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  expectations: z.string().min(1, "Expectations are required"),
});

export async function POST(req: NextRequest) {
  const validation = createToolRequestSchema.safeParse(await req.json());
  if (!validation.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
 try {
    const { title, description, expectations, categoryId } = validation.data;
    const generatedTool = await generateTool(title, description, expectations);
    console.log("Generated tool: ", generatedTool);
    
    if (!generatedTool) {
      return NextResponse.json({ error: "Failed to generate tool" }, { status: 500 });
    }
    
    // Transform the generated tool data to match the expected format for /api/tools
    const toolData = {
      title,
      description,
      systemInstructions: generatedTool.systemInstructions,
      questions: generatedTool.questions.map((question: string) => ({
        question,
        answer: "",
        maxAnsLength: 600
      })),
      isPro: false,
      isActive: true,
      category: categoryId
    };
    
    // Send POST request to /api/tools
    const response = await fetch(`${process.env.AUTH_URL}/api/tools`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': req.headers.get('cookie') || ''
      },
      body: JSON.stringify(toolData)
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error("Failed to create tool:", errorData);
      return NextResponse.json(
        { error: "Failed to create tool", details: errorData },
        { status: response.status }
      );
    }
    
   
    return NextResponse.json({message: "Tool created successfully"});
 } catch (error) {
    console.error("Error generating tool: ", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 }
};

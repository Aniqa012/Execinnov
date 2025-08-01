import dbConnect from "@/lib/dbConnection";
import { Tool } from "@/app/Models/Tools";
import { Category } from "@/app/Models/Tools";
import EditToolForm from "@/components/EditToolForm";
import { notFound } from "next/navigation";
import { ToolLean, QuestionLean, CategoryLean } from "@/lib/types";

interface EditToolPageProps {
  params: Promise<{
    toolId: string;
  }>;
}

async function getTool(toolId: string) {
  try {
    await dbConnect();
    const tool = await Tool.findById(toolId)
      .populate('category', 'name')
      .lean();

    if (!tool) {
      return null;
    }

    const toolData = tool as unknown as ToolLean;
    return {
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
    };
  } catch (error) {
    console.error("Failed to fetch tool:", error);
    return null;
  }
}

async function getCategories() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true })
      .select('name isActive')
      .lean();
    
    // Convert MongoDB ObjectId to string for JSON serialization
    return categories.map((category) => {
      const cat = category as unknown as CategoryLean;
      return {
        id: cat._id.toString(),
        name: cat.name,
        isActive: cat.isActive,
      };
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function EditToolPage({ params }: EditToolPageProps) {
  const { toolId } = await params;
  const [tool, categories] = await Promise.all([
    getTool(toolId),
    getCategories(),
  ]);

  if (!tool) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6">
      <EditToolForm tool={tool} categories={categories} />
    </div>
  );
} 
import dbConnect from "@/lib/dbConnection";
import {Category} from "@/app/Models/Tools";
import AddToolForm from "@/components/AddToolForm";
import { CategoryLean } from "@/lib/types";

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
        _id: cat._id.toString(),
        name: cat.name,
        isActive: cat.isActive,
      };
    });
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    return [];
  }
}

export default async function AddToolPage() {
  const categories = await getCategories();

  return (
    <div className="container mx-auto py-6">
      <AddToolForm categories={categories} />
    </div>
  );
} 
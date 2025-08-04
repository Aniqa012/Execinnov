import dbConnect from "@/lib/dbConnection";
import {Category} from "@/app/Models/Tools";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { CategoryLean } from "@/lib/types";

const createCategorySchema = z.object({
    name: z.string().min(1),
    isActive: z.boolean().default(true),
})

export async function GET() {
    try {
        await dbConnect();
        
        const categories = await Category.find({ isActive: true })
            .sort({ name: 1 })
            .lean();
            
        // Serialize the data properly
        const serializedCategories = categories.map((category) => {
            const cat = category as unknown as CategoryLean;
            return {
                id: cat._id.toString(),
                name: cat.name,
                isActive: cat.isActive,
                createdAt: cat.createdAt?.toISOString(),
                updatedAt: cat.updatedAt?.toISOString()
            };
        });
        
        return NextResponse.json({ categories: serializedCategories });
    } catch (error) {
        console.error("Failed to fetch categories:", error);
        return NextResponse.json(
            { error: "Failed to fetch categories" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest){
    const validation = createCategorySchema.safeParse(await req.json())
    if(!validation.success){
        return NextResponse.json({error: validation.error.message}, {status: 400})
    }
   try {
    await dbConnect()
    const category = await Category.create(validation.data)
    return NextResponse.json({name: category.name, isActive: category.isActive}, {status: 201})
   } catch (error) {
    console.error("Failed to create category:", error)
    return NextResponse.json({error: "Failed to create category"}, {status: 500})
    
   }
}
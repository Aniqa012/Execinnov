import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnection";
import User from "@/app/Models/User";
import { UserLean } from "@/lib/types";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const filter = searchParams.get('filter');
        
        await dbConnect();
        
        let query = {};
        
        if (filter === 'admin') {
            query = { isAdmin: true };
        } else if (filter === 'regular') {
            query = { isAdmin: false };
        }
        
        const users = await User.find(query)
            .select('name email isAdmin image createdAt updatedAt')
            .sort({ createdAt: -1 })
            .lean();
        
        // Convert MongoDB ObjectId to string for JSON serialization
        const formattedUsers = users.map((user) => {
            const u = user as unknown as UserLean;
            return {
                _id: u._id.toString(),
                name: u.name,
                email: u.email,
                isAdmin: u.isAdmin,
                image: u.image,
                createdAt: u.createdAt?.toISOString(),
                updatedAt: u.updatedAt?.toISOString()
            };
        });
        
        return NextResponse.json({ users: formattedUsers });
    } catch (error) {
        console.error("Failed to fetch users:", error);
        return NextResponse.json({ error: "Server Error Occurred" }, { status: 500 });
    }
} 
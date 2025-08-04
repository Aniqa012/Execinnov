import User from "@/app/Models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnection";
import { auth } from "@/app/auth";
import { z } from "zod";

const createUserSchema = z.object({
    email: z.string().email("Invalid Email"),
    password: z.string().min(4, "Password must be more than 4 characters").max(32, "Password must be less than 32 characters"),
    name: z.string().min(1, "Name is required"),
    isAdmin: z.boolean().default(false),
});

export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        
        // Check if user is authenticated and is admin
        if (!session || !session.user.isAdmin) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        await dbConnect();
        
        const body = await req.json();
        const validation = createUserSchema.safeParse(body);
        
        if (!validation.success) {
            return NextResponse.json({ 
                error: "Validation failed", 
                details: validation.error.issues 
            }, { status: 400 });
        }
        
        const { email, password, name, isAdmin } = validation.data;
        
        // Check if user with this email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User with this email already exists" }, { status: 400 });
        }
        
        // Hash the password using the same method as signup
        const encryptedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT_ROUNDS || 10);
        
        // Create the user
        const newUser = await User.create({
            email,
            password: encryptedPassword,
            name,
            isAdmin
        });
        
        // Return user data without password
        const userResponse = {
            _id: newUser._id.toString(),
            name: newUser.name,
            email: newUser.email,
            isAdmin: newUser.isAdmin,
            image: newUser.image,
            createdAt: newUser.createdAt?.toISOString(),
            updatedAt: newUser.updatedAt?.toISOString()
        };
        
        return NextResponse.json({ 
            message: `${isAdmin ? 'Admin' : 'User'} created successfully`,
            user: userResponse 
        });
    } catch (error) {
        console.error("Failed to create user:", error);
        return NextResponse.json({ error: "Server Error Occurred" }, { status: 500 });
    }
} 
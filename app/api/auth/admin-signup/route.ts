import User from "@/app/Models/User";
import { signUpSchema } from "@/lib/zod";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnection";

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const validation = signUpSchema.safeParse(await req.json());
        if (!validation.success) {
            return NextResponse.json({ error: validation.error.message }, { status: 400, statusText: "Bad Request" });
        }
        const { email, password, name } = validation.data;
        const encryptedPassword = await bcrypt.hash(password, process.env.BCRYPT_SALT_ROUNDS || 10);
        await User.create({ email, password: encryptedPassword, name, isAdmin: true });
        return NextResponse.json({ message: "Admin created successfully" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Server Error Occured" }, { status: 500, statusText: "Internal Server Error" });
    }
}

import { NextRequest, NextResponse } from "next/server";
import User from "@/app/Models/User";
import { z } from "zod";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnection";
import jwt from "jsonwebtoken";

const resetPasswordSchema = z
  .object({
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(1),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export async function PATCH(req: NextRequest) {
  try {
    const validation = resetPasswordSchema.safeParse(await req.json());

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.message },
        { status: 400 }
      );
    }

    const { newPassword } = validation.data;

    const verificationToken = req.cookies.get("verification-token")?.value;

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Verification token not found" },
        { status: 401 }
      );
    }

    let decodedToken: { id: string };
    try {
      decodedToken = jwt.verify(
        verificationToken,
        process.env.AUTH_SECRET!
      ) as { id: string };
    } catch (error) {
      console.error("Reset password error:", error);
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 401 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const hashedPassword = await bcrypt.hash(
      newPassword,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
    );

    user.password = hashedPassword;
    await user.save();

    const response = NextResponse.json(
      { message: "Password reset successfully" },
      { status: 200 }
    );

    response.cookies.set({
      name: "verification-token",
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

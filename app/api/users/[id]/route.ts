import User from "@/app/Models/User";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcrypt";
import dbConnect from "@/lib/dbConnection";
import Verification from "@/app/Models/Verification";
interface IParams {
  params: Promise<{ id: string }>;
}

const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(1, "Name is required")
      .max(100, "Name must be less than 100 characters")
      .optional(),
    currentPassword: z
      .string()
      .min(1, "Current password is required")
      .max(100, "Current password must be less than 100 characters"),
    newPassword: z
      .string()
      .min(1, "New password is required")
      .max(100, "New password must be less than 100 characters")
      .optional(),
    otp: z.string().min(1, "OTP is required").max(6, "OTP must be 6 characters"),
  })
  .refine(
    (data) => {
      // At least one of name or newPassword must be present and non-empty
      return (
        (data.name && data.name.trim() !== "") ||
        (data.newPassword && data.newPassword.trim() !== "")
      );
    },
    {
      message: "At least one of name or new password must be provided.",
      path: ["name", "newPassword"],
    }
  );

export async function PATCH(req: NextRequest, { params }: IParams) {
  const { id } = await params;
  const validation = updateUserSchema.safeParse(await req.json());
  if (!validation.success) {
    return NextResponse.json(
      { error: validation.error.message },
      { status: 400 }
    );
  }
  const { name, currentPassword, newPassword, otp } = validation.data;

  await dbConnect();
  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    const verification = await Verification.findOne({ email: user.email });
    if (!verification) {
      return NextResponse.json({ error: "OTP expired" }, { status: 400 });
    }
    if (verification.otp !== otp) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
    }
    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return NextResponse.json(
        { error: "Invalid current password" },
        { status: 400 }
      );
    }
    if (newPassword) {
      const hashedPassword = await bcrypt.hash(
        newPassword,
        process.env.BCRYPT_SALT_ROUNDS || 10
      );
      user.password = hashedPassword;
    }
    user.name = name;
    await user.save();
    await Verification.deleteOne({ email: user.email });
    return NextResponse.json({ message: "User updated successfully" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

import User from "@/app/Models/User";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import dbConnect from "@/lib/dbConnection";
import { writeFile, unlink } from "fs/promises";
import { join } from "path";

interface IParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: IParams) {
  const { id } = await params;

  await dbConnect();

  try {
    const formData = await req.formData();
    const file = formData.get("profilePicture") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 });
    }

    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `profile_${id}_${timestamp}.${fileExtension}`;
    const filePath = join(process.cwd(), "public", "profile", fileName);
    console.log("Constructed file path: ", filePath);

    // Convert file to buffer and save
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);
    console.log("Saved file to: ", filePath);

    // Delete old profile picture if it exists and is not the default
    if (user.image && user.image !== "/media/avatar.avif" && !user.image.startsWith("data:")) {
      try {
        const oldImagePath = join(process.cwd(), "public", user.image.replace(/^\//, ""));
        await unlink(oldImagePath);
      } catch (error) {
        console.error("Error deleting old profile picture:", error);
      }
    }

    // Update user with new image path
    user.image = `/profile/${fileName}`;
    await user.save();

    return NextResponse.json({ 
      message: "Profile picture updated successfully",
      imageUrl: user.image 
    }, { status: 200 });

  } catch (error) {
    console.error("Error uploading profile picture:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: IParams) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.id !== id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await dbConnect();

  try {
    const user = await User.findById(id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Delete current profile picture if it exists and is not the default
    if (user.image && user.image !== "/media/avatar.avif" && !user.image.startsWith("data:")) {
      try {
        const imagePath = join(process.cwd(), "public", user.image.replace(/^\//, ""));
        await unlink(imagePath);
      } catch (error) {
        console.error("Error deleting profile picture:", error);
      }
    }

    // Reset to default avatar
    user.image = "/media/avatar.avif";
    await user.save();

    return NextResponse.json({ 
      message: "Profile picture removed successfully",
      imageUrl: user.image 
    }, { status: 200 });

  } catch (error) {
    console.error("Error removing profile picture:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
} 
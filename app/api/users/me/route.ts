import { NextResponse } from "next/server";
import User from "@/app/Models/User";
import dbConnect from "@/lib/dbConnection";
import { auth } from "@/app/auth";

export const GET = auth(async function GET(req) {
  console.log("req.auth: ", req.auth);
  if (!req.auth?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const userId = req.auth.user.id;
  await dbConnect();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const user = await User.findById(userId);
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: user._id,
    name: user.name,
    email: user.email,
    image: user.image,
  });
});

import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnection";
import Theme from "@/app/Models/Theme";

export async function GET() {
  await dbConnect();
  let theme = await Theme.findOne();
  if (!theme) {
    theme = await Theme.create({});
  }
  return NextResponse.json({
    success: true,
    data: {
      customPrimary: theme.customPrimary,
      customSecondary: theme.customSecondary,
      customTertiary: theme.customTertiary,
    },
  });
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  let theme = await Theme.findOne();
  if (!theme) {
    theme = await Theme.create({});
  }
  theme.customPrimary = body.customPrimary || theme.customPrimary;
  theme.customSecondary = body.customSecondary || theme.customSecondary;
  theme.customTertiary = body.customTertiary || theme.customTertiary;
  await theme.save();
  return NextResponse.json({
    success: true,
    data: {
      customPrimary: theme.customPrimary,
      customSecondary: theme.customSecondary,
      customTertiary: theme.customTertiary,
    },
  });
} 
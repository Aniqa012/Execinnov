import { NextRequest, NextResponse } from "next/server";
import Verification from "@/app/Models/Verification";
import User from "@/app/Models/User";
import { z } from "zod";
import dbConnect from "@/lib/dbConnection";
import { generateOTP, sendVerificationEmail } from "@/lib/emailService";
import jwt from "jsonwebtoken";

const verificationReqSchema = z.object({
    email: z.string().email().min(1),
    otp: z.string().min(1),
})

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const email = searchParams.get("email");
    const isEmailValid = z.string().email().safeParse(email);
    if (!email || !isEmailValid.success) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    try {
      await dbConnect();
      const verification = await Verification.findOne({ email });
      if (verification) {
        await Verification.deleteOne({ email });
      }
  
      const otp = generateOTP();
      await sendVerificationEmail(email, otp);
      await Verification.create({ email, otp });
      return NextResponse.json({ message: "OTP sent to email" }, { status: 200 });
    } catch (error) {
      console.error("Error sending verification email:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  }


export async function POST(req: NextRequest) {
    const validation = verificationReqSchema.safeParse(await req.json());
    const { searchParams } = new URL(req.url);
    const shouldReturnToken = searchParams.get("token") === "true";

    if (!validation.success) {
        return NextResponse.json({ error: validation.error.message }, { status: 400 });
    }

    try {
        await dbConnect();
        const verification = await Verification.findOne({ email: validation.data.email });

        if (!verification) {
            return NextResponse.json({ error: "OTP expired" }, { status: 400 });
        }

        if (verification.otp !== validation.data.otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (verification.otp === validation.data.otp) {
            // Update user verification status
            const user = await User.findOneAndUpdate(
                { email: validation.data.email },
                { emailVerified: true },
                { new: true }
            );

            await Verification.deleteOne({ email: validation.data.email });

            // If token is requested, create and return JWT token
            if (shouldReturnToken && user) {
                const tokenPayload = {
                    id: user._id.toString(),
                    isAdmin: user.isAdmin,
                };

                const token = jwt.sign(tokenPayload, process.env.AUTH_SECRET!, {
                    expiresIn: '5m' // 5 minutes expiration
                });

                const response = NextResponse.json(
                    { message: "OTP verified successfully" },
                    { status: 200 }
                );

                // Set secure HTTP-only cookie
                response.cookies.set({
                    name: 'verification-token',
                    value: token,
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    sameSite: 'strict',
                    maxAge: 5 * 60, // 5 minutes in seconds
                    path: '/'
                });

                return response;
            }

            return NextResponse.json({ message: "Email verified successfully" }, { status: 200 });
        }

        return NextResponse.json({ error: "Failed to verify OTP" }, { status: 400 });

    } catch (error) {
        console.error("Verification error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import dbConnect from "@/lib/dbConnection";
import Notification from "@/app/Models/Notification";
import User from "@/app/Models/User";

// Send pro plan notification to free users
export const POST = auth(async function POST(req) {
    if (!req.auth?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        
        // Get the user to check their subscription
        const user = await User.findById(req.auth.user.id);
        
        if (!user || user.subscription !== "Free") {
            return NextResponse.json({ message: "User is not on free plan" }, { status: 200 });
        }

        // Check if there's a recent pro plan notification (within last 10 minutes)
        const recentNotification = await Notification.findOne({
            userId: req.auth.user.id,
            type: "pro_plan",
            createdAt: { $gte: new Date(Date.now() - 10 * 60 * 1000) } // 10 minutes
        });

        if (recentNotification) {
            return NextResponse.json({ message: "Recent notification exists" }, { status: 200 });
        }

        // Create new pro plan notification
        const notification = await Notification.create({
            userId: req.auth.user.id,
            title: "Upgrade to Pro Plan",
            message: "Create unlimited AI tools and unlock premium features with our Pro Plan!",
            type: "pro_plan",
            link: "/billing",
        });

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Failed to create pro plan notification:", error);
        return NextResponse.json(
            { error: "Failed to create notification" },
            { status: 500 }
        );
    }
});
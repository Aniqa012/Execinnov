import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import dbConnect from "@/lib/dbConnection";
import Notification from "@/app/Models/Notification";

// Get all notifications for the current user
export const GET = auth(async function GET(req) {
    if (!req.auth?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        await dbConnect();
        const notifications = await Notification.find({ userId: req.auth.user.id })
            .sort({ createdAt: -1 })
            .lean();

        return NextResponse.json(notifications);
    } catch (error) {
        console.error("Failed to fetch notifications:", error);
        return NextResponse.json(
            { error: "Failed to fetch notifications" },
            { status: 500 }
        );
    }
});

// Mark notifications as read
export const PATCH = auth(async function PATCH(req) {
    if (!req.auth?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { notificationIds } = await req.json();
        await dbConnect();

        await Notification.updateMany(
            {
                _id: { $in: notificationIds },
                userId: req.auth.user.id
            },
            { $set: { isRead: true } }
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Failed to update notifications:", error);
        return NextResponse.json(
            { error: "Failed to update notifications" },
            { status: 500 }
        );
    }
});
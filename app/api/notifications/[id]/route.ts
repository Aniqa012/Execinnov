import { NextResponse } from "next/server";
import { auth } from "@/app/auth";
import dbConnect from "@/lib/dbConnection";
import Notification from "@/app/Models/Notification";

export const PATCH = auth(async function PATCH(req) {
    if (!req.auth?.user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const id = req.nextUrl.pathname.split('/').pop();
    if (!id) {
        return NextResponse.json({ error: "Invalid notification ID" }, { status: 400 });
    }

    try {
        await dbConnect();
        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId: req.auth.user.id },
            { $set: { isRead: true } },
            { new: true }
        );

        if (!notification) {
            return NextResponse.json(
                { error: "Notification not found" },
                { status: 404 }
            );
        }

        return NextResponse.json(notification);
    } catch (error) {
        console.error("Failed to update notification:", error);
        return NextResponse.json(
            { error: "Failed to update notification" },
            { status: 500 }
        );
    }
});
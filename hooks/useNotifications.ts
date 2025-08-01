import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

interface Notification {
    _id: string;
    userId: string;
    title: string;
    message: string;
    type: "ai_completion" | "pro_plan" | "system";
    isRead: boolean;
    link: string | null;
    createdAt: string;
}

async function fetchNotifications(): Promise<Notification[]> {
    const response = await fetch("/api/notifications");
    if (!response.ok) {
        throw new Error("Failed to fetch notifications");
    }
    return response.json();
}

async function markAsRead(notificationIds: string[]): Promise<void> {
    const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationIds }),
    });
    if (!response.ok) {
        throw new Error("Failed to mark notifications as read");
    }
}

export function useNotifications() {
    const queryClient = useQueryClient();

    const { data: notifications = [], ...queryRest } = useQuery({
        queryKey: ["notifications"],
        queryFn: fetchNotifications,
        // Refetch every 10 seconds
        refetchInterval: 10000,
        // Keep refetching even when the window is not focused
        refetchIntervalInBackground: true,
    });

    const markAsReadMutation = useMutation({
        mutationFn: markAsRead,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["notifications"] });
        },
    });

    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return {
        notifications,
        unreadCount,
        markAsRead: markAsReadMutation.mutate,
        isLoading: queryRest.isLoading || markAsReadMutation.isPending,
        error: queryRest.error || markAsReadMutation.error,
    };
}
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area" // Assuming you have ScrollArea, if not, it's a shadcn component.

import { useNotifications } from "@/hooks/useNotifications";
import { formatDistanceToNow } from "date-fns";

export default function NotificationCenterPage() {
  const { notifications, unreadCount, markAsRead, isLoading } = useNotifications();

  return (
    <div className="container mx-auto py-8 h-full">
      <Card className="w-full h-full">
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <div>
            <CardTitle className="text-2xl">Notification Center</CardTitle>
            <CardDescription>
              You have {unreadCount} unread message{unreadCount !== 1 ? "s" : ""}.
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="ml-auto bg-transparent"
            onClick={() => markAsRead(notifications.filter(n => !n.isRead).map(n => n._id))}
            disabled={unreadCount === 0 || isLoading}
          >
            Mark all as read
          </Button>
        </CardHeader>
        <CardContent className="p-6 flex-1 overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {" "}
            {/* Added pr-4 for scrollbar spacing */}
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">No new notifications.</div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification._id}
                    className="flex items-start gap-4 p-3 rounded-md transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    {notification.isRead ? (
                      <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-transparent" />
                    ) : (
                      <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
                    )}
                    <div className="grid gap-1 flex-1">
                      <p className="text-sm font-medium leading-none">{notification.title}</p>
                      <p className="text-sm">{notification.message}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {notification.link && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="ml-auto"
                        onClick={() => {
                          markAsRead([notification._id]);
                          window.location.href = notification.link!;
                        }}
                      >
                        View
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

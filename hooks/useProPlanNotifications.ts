import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

export function useProPlanNotifications() {
    const queryClient = useQueryClient();

    useEffect(() => {
        // Function to send pro plan notification
        async function sendProPlanNotification() {
            try {
                await fetch('/api/notifications/pro-plan', {
                    method: 'POST',
                });
                // Invalidate notifications query to show new notification
                queryClient.invalidateQueries({ queryKey: ['notifications'] });
            } catch (error) {
                console.error('Failed to send pro plan notification:', error);
            }
        }

        // Initial check
        sendProPlanNotification();

        // Set up interval for periodic checks (every 10 minutes)
        const interval = setInterval(sendProPlanNotification, 10 * 60 * 1000);

        // Cleanup interval on unmount
        return () => clearInterval(interval);
    }, [queryClient]);
}
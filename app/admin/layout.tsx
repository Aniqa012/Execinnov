import AdminSidebar from "@/components/AdminSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Toaster } from "react-hot-toast";
import { auth } from "@/app/auth";
import { redirect } from "next/navigation";

export default async function Layout({ children }: { children: React.ReactNode }) {
    const session = await auth();
    if (!session || !session.user || !session.user.isAdmin) {
        redirect("/signin");
    }
    return (
        <SidebarProvider>
            <AdminSidebar />
            <main className="flex-1 p-6">
                <SidebarTrigger />
                {children}
            </main>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        background: '#363636',
                        color: '#fff',
                    },
                    success: {
                        duration: 3000,
                        style: {
                            background: '#10b981',
                            color: '#fff',
                        },
                    },
                    error: {
                        duration: 5000,
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                        },
                    },
                }}
            />
        </SidebarProvider>
    );
}
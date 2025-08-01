import { FloatingNav } from "@/components/ui/floating-navbar";
import { Brain, ToolCaseIcon, User } from "lucide-react";
import { redirect } from "next/navigation";
import { auth } from "../auth";

export default async function UserLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  // Redirect if not authenticated
  if (!session) {
    redirect("/api/auth/signin");
  }
  return (
    <div>
      <FloatingNav  navItems={[{name: 'Tools', link: '/tools', icon: <ToolCaseIcon/>}, {name: 'AI Solutions', link: '/solutions', icon: <Brain />}, {name: 'Plan & Billing', link: '/billing', icon: <User />}, {name: 'Profile', link: '/profile', icon: <User />}]} />
      <div className="flex flex-1 flex-col mt-32">
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 flex-col gap-2">
            {children}
          </div>
        </div>
      </div>
    </div>
  )

  // return (
  //   <SidebarProvider
  //     style={
  //       {
  //         "--sidebar-width": "calc(var(--spacing) * 72)",
  //         "--header-height": "calc(var(--spacing) * 12)",
  //       } as React.CSSProperties
  //     }
  //   >
  //     <UserSidebar user={session.user} variant="inset" />
  //     <SidebarInset>
  //       <SiteHeader />
  //       <div className="flex flex-1 flex-col">
  //         <div className="@container/main flex flex-1 flex-col gap-2">
  //           <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
  //             {children}
  //           </div>
  //         </div>
  //       </div>
  //     </SidebarInset>
  //   </SidebarProvider>
  // );
}

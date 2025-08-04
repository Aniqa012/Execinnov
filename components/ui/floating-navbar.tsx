"use client"
import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ModeToggle } from "../ThemeToggle"
import { useTheme } from "next-themes"
import Image from "next/image"
import { Bell } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface NavItem {
  name: string
  link: string
  icon?: React.ReactElement
}

export const FloatingNav = ({
  navItems,
  className,
}: {
  navItems: NavItem[]
  className?: string
}) => {
  const pathname = usePathname()
  const { scrollYProgress } = useScroll()
  const [mounted, setMounted] = useState(false)
  const { resolvedTheme } = useTheme()

  const [visible, setVisible] = useState(true) // Keep scroll-based visibility logic

  useEffect(() => {
    setMounted(true)
  }, [])

  const logoSrc = mounted ? (resolvedTheme === "dark" ? "/betop_light.png" : "/betop_dark.png") : "/betop_dark.png" // Default fallback

  useMotionValueEvent(scrollYProgress, "change", (current) => {
    // Check if current is not undefined and is a number
    if (typeof current === "number") {
      const direction = current! - scrollYProgress.getPrevious()!

      if (scrollYProgress.get() < 0.05) {
        setVisible(true)
      } else {
        if (direction < 0) {
          setVisible(true)
        } else {
          setVisible(true)
        }
      }
    }
  })

  // Dummy notifications for demonstration
  const notifications = [
    { id: 1, message: "Your call has been confirmed.", time: "5 min ago", unread: true },
    { id: 2, message: "You have a new message!", time: "1 min ago", unread: true },
    { id: 3, message: "Your subscription is expiring soon!", time: "2 hours ago", unread: true },
    { id: 4, message: "New feature: Dark Mode is here!", time: "Yesterday", unread: false },
    { id: 5, message: "Your payment was successful.", time: "2 days ago", unread: false },
    { id: 6, message: "Welcome to our platform!", time: "3 days ago", unread: false },
    { id: 7, message: "Reminder: Upcoming event next week.", time: "4 days ago", unread: false },
    { id: 8, message: "Your profile has been updated.", time: "1 week ago", unread: false },
  ]

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{
          opacity: 1,
          y: 0, // Changed this from -100 to 0 to prevent initial drop-in animation
        }}
        animate={{
          y: visible ? 0 : -100,
          opacity: visible ? 1 : 0,
        }}
        transition={{
          duration: 0.2,
        }}
        className={cn(
          "flex container fixed top-10 inset-x-0 mx-auto border border-transparent dark:border-white/[0.2] rounded-full dark:bg-[rgb(9,21,51)] bg-[#F9FAFB] shadow-[0px_2px_3px_-1px_rgba(0,0,0,0.1),0px_1px_0px_0px_rgba(25,28,33,0.02),0px_0px_0px_1px_rgba(25,28,33,0.08)] z-[5000] px-8 py-2 items-center justify-between",
          className,
        )}
      >
        {/* Navigation Items - Left Side */}
        <div className="flex items-center space-x-4">
          {navItems.map((navItem: NavItem, idx: number) => {
            const isActive = pathname.includes(navItem.link)
            return (
              <Link
                key={`link=${idx}`}
                href={navItem.link}
                className={cn(
                  "relative dark:text-neutral-50 items-center flex space-x-1 text-neutral-600 dark:hover:text-neutral-300 hover:text-neutral-500",
                  isActive &&
                    "border text-sm font-medium relative border-neutral-200 dark:border-white/[0.2] text-black dark:text-white px-4 py-2 rounded-full",
                )}
              >
                <span className={cn("block sm:hidden")}>{navItem.icon}</span>
                <span className="hidden sm:block text-sm">{navItem.name}</span>
                {isActive && (
                  <span className="absolute inset-x-0 w-1/2 mx-auto -bottom-px bg-gradient-to-r from-transparent via-blue-500 to-transparent  h-px" />
                )}
              </Link>
            )
          })}
        </div>

        {/* Right Side - Theme Toggle and Logo */}
        <div className="flex items-center space-x-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="w-5 h-5" />
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-80">
              <Card className="shadow-none border-0">
                <CardHeader className="border-b">
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    You have {notifications.filter((n) => n.unread).length} unread messages.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 max-h-60 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0"
                    >
                      {notification.unread && (
                        <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-blue-500" />
                      )}
                      {!notification.unread && (
                        <span className="flex h-2 w-2 translate-y-1.5 rounded-full bg-transparent" />
                      )}
                      <div className="grid gap-1">
                        <p className="text-sm font-medium">{notification.message}</p>
                        <p className="text-sm text-muted-foreground">{notification.time}</p>
                      </div>
                    </div>
                  ))}
                </CardContent>
                <div className="border-t p-4 text-center">
                  <Link href="/notification-center" className="text-sm font-medium text-blue-600 hover:underline">
                    View All Notifications
                  </Link>
                </div>
              </Card>
            </PopoverContent>
          </Popover>
          <ModeToggle />
          {/* Betop Logo */}
          {mounted && (
            <Image
              src={logoSrc || "/placeholder.svg"}
              alt="Betop Logo"
              className="w-24 h-auto"
              draggable={false}
              width={80}
              height={80}
            />
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

"use client";

import { signInSchema } from "@/lib/zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { signIn } from "next-auth/react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import Image from "next/image";

type SignInFormData = z.infer<typeof signInSchema>;

export default function SignInClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted
    ? resolvedTheme === "dark"
      ? "/betop_light.png"
      : "/betop_dark.png"
    : "/betop_dark.png"; // Default fallback

  // Get any message from URL params (e.g., from successful signup)
  const urlMessage = searchParams.get("message");

  const form = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onChange", // Real-time validation
  });

  const onSubmit = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      setErrorMessage("");

      const result = await signIn("credentials", {
        email: data.email,
        password: data.password,
        redirect: false, // Don't redirect automatically
      });

      if (result?.error) {
        // Handle different error types
        let userFriendlyMessage = "";

        if (result.error.includes("User not found")) {
          userFriendlyMessage = "No account found with this email address.";
        } else if (result.error.includes("Invalid password")) {
          userFriendlyMessage = "Incorrect password. Please try again.";
        } else if (result.error.includes("Server Error")) {
          userFriendlyMessage = "Something went wrong. Please try again later.";
        } else {
          userFriendlyMessage =
            "Invalid email or password. Please check your credentials.";
        }

        setErrorMessage(userFriendlyMessage);
        toast.error(userFriendlyMessage);
      } else if (result?.ok) {
        toast.success("Welcome back!");
        form.reset();

        // Redirect to dashboard or intended page
        const callbackUrl = searchParams.get("callbackUrl") || "/tools";
        router.push(callbackUrl);
        router.refresh(); // Refresh to update session
      }
    } catch (error) {
      console.error("Sign in error:", error);
      const fallbackMessage = "Something went wrong. Please try again.";
      setErrorMessage(fallbackMessage);
      toast.error(fallbackMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Clear error message when user starts typing
  const handleFieldChange = () => {
    if (errorMessage) {
      setErrorMessage("");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Image
        src={logoSrc}
        alt="Betop Logo"
        className="w-32 h-auto mb-6"
        draggable={false}
        width={128}
        height={128}
      />
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>

          {/* Display URL message if present */}
          {urlMessage && (
            <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
              {urlMessage}
            </div>
          )}
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Email Field */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          className="pl-10"
                          disabled={isLoading}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFieldChange();
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Password Field */}
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter your password"
                          className="pl-10 pr-10"
                          disabled={isLoading}
                          {...field}
                          onChange={(e) => {
                            field.onChange(e);
                            handleFieldChange();
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={togglePasswordVisibility}
                          disabled={isLoading}
                        >
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <Eye className="h-4 w-4 text-muted-foreground" />
                          )}
                          <span className="sr-only">
                            {showPassword ? "Hide password" : "Show password"}
                          </span>
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || !form.formState.isValid}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* Error Display */}
              {errorMessage && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {errorMessage}
                </div>
              )}
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Don&apos;t have an account?{" "}
            </span>
            <Link
              href="/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>

          {/* Forgot Password Link (if needed) */}
          <div className="mt-2 text-center text-sm">
            <Link
              href="/reset-password"
              className="text-muted-foreground hover:text-primary hover:underline"
            >
              Forgot your password?
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

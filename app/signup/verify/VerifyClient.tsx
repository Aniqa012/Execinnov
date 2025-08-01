"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTheme } from "next-themes";
import { Loader2, Mail, Clock } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

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

const verifySchema = z.object({
  otp: z.string().min(6, "OTP must be at least 6 characters").max(6, "OTP must be 6 characters"),
});

type VerifyFormData = z.infer<typeof verifySchema>;

interface VerifyResponse {
  message: string;
}

export default function VerifyClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [mounted, setMounted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft]);

  const logoSrc = mounted
    ? resolvedTheme === "dark"
      ? "/betop_light.png"
      : "/betop_dark.png"
    : "/betop_dark.png";

  const form = useForm<VerifyFormData>({
    resolver: zodResolver(verifySchema),
    defaultValues: {
      otp: "",
    },
  });

  const verifyMutation = useMutation({
    mutationFn: async (data: VerifyFormData): Promise<VerifyResponse> => {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: data.otp,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to verify OTP");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Email verified successfully!");
      router.push("/signin?message=Email verified successfully. Please sign in.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to verify OTP");
    },
  });

  const onSubmit = (data: VerifyFormData) => {
    verifyMutation.mutate(data);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  if (!email) {
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
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2">Invalid Request</h2>
              <p className="text-muted-foreground mb-4">
                No email provided for verification.
              </p>
              <Link href="/signup">
                <Button>Go Back to Sign Up</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
            Verify your email
          </CardTitle>
          <CardDescription className="text-center">
            We&apos;ve sent a verification code to{" "}
            <span className="font-medium text-foreground">{email}</span>
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* OTP Field */}
              <FormField
                control={form.control}
                name="otp"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Verification Code</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Enter 6-digit code"
                          className="pl-10 text-center text-lg tracking-widest"
                          disabled={verifyMutation.isPending || timeLeft === 0}
                          maxLength={6}
                          {...field}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Timer */}
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>
                  Code expires in:{" "}
                  <span className={`font-medium ${timeLeft <= 60 ? "text-destructive" : ""}`}>
                    {formatTime(timeLeft)}
                  </span>
                </span>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={verifyMutation.isPending || timeLeft === 0 || !form.formState.isValid}
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>

              {/* Error Display */}
              {verifyMutation.isError && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  {verifyMutation.error?.message ||
                    "Something went wrong. Please try again."}
                </div>
              )}

              {/* Expired Message */}
              {timeLeft === 0 && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                  Verification code has expired. Please sign up again.
                </div>
              )}
            </form>
          </Form>

          {/* Sign In Link */}
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already verified?{" "}
            </span>
            <Link
              href="/signin"
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
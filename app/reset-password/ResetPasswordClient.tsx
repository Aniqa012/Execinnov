"use client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";
import Link from "next/link";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useSendOtp } from "@/hooks/useSendOtp";

function ResetPasswordClient() {
  const [step, setStep] = useState<"email" | "otp" | "password" | "done">(
    "email"
  );
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { resolvedTheme } = useTheme();
  const router = useRouter();
  const { mutateAsync: sendOtp, isPending: isOtpSending } = useSendOtp();

  const logoSrc =
    resolvedTheme === "dark" ? "/betop_light.png" : "/betop_dark.png";

  async function handleEmailSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const isValidEmail = z.string().email().safeParse(email);
    if (!isValidEmail.success) {
      setError("Please enter a valid email address.");
      return;
    }

    await sendOtp(email);
    setStep("otp");
  }

  async function handleOtpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!otp || otp.length < 4) {
      setError("Please enter the verification code.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`/api/auth/verify?token=true`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("password");
      } else {
        setError(data.error || "Invalid verification code");
      }
    } catch (error) {
      console.log(error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Password validation
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ newPassword, confirmPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setStep("done");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (error) {
      console.log(error);
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center mb-6">
        <Image
          src={logoSrc}
          alt="Logo"
          width={120}
          height={120}
          priority
          className="mb-2"
        />
        <h1 className="text-2xl font-bold mb-2 text-center">
          Reset your Password
        </h1>
      </div>
      <Card className="w-full max-w-md p-8 space-y-6">
        {step === "email" && (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email" className="mb-4">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                autoFocus
                disabled={isOtpSending}
              />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={isOtpSending}>
              {isOtpSending ? "Sending..." : "Send Verification Code"}
            </Button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <div className="text-muted-foreground text-sm mb-2">
              A verification code has been sent to {email}
            </div>
            <div>
              <Label htmlFor="otp" className="mb-4">
                Verification Code
              </Label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="Enter the verification code"
                required
                autoFocus
                disabled={loading}
              />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </form>
        )}

        {step === "password" && (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="text-muted-foreground text-sm mb-2">
              Enter your new password
            </div>
            <div>
              <Label htmlFor="newPassword" className="mb-4">
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                autoFocus
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="mb-4">
                Confirm Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                disabled={loading}
              />
            </div>
            {error && <div className="text-destructive text-sm">{error}</div>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        )}

        {step === "done" && (
          <div className="text-center space-y-4">
            <div className="text-green-600 font-medium">
              Password reset successfully!
            </div>
            <div className="text-muted-foreground text-sm">
              Your password has been updated. You can now sign in with your new
              password.
            </div>
            <Button onClick={() => router.push("/signin")} className="w-full">
              Go to Sign In
            </Button>
          </div>
        )}
      </Card>
      <Link href="/signin" className="mt-6 w-full max-w-md flex justify-center">
        <Button variant="ghost" className="w-full">
          Back to Sign In
        </Button>
      </Link>
    </div>
  );
}

export default ResetPasswordClient;

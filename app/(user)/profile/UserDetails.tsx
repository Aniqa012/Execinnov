"use client";
import ProfilePictureUpload from "@/components/ProfilePictureUpload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useMutation } from "@tanstack/react-query";
import { Moon, Sun, Monitor, LogOut } from "lucide-react";
import { Session } from "next-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useSendOtp } from "@/hooks/useSendOtp";
import { useEffect } from "react";
import { signOut } from "next-auth/react";

function UserDetails({ user }: { user: Session["user"] }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [currentUser, setCurrentUser] = useState(user);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpExpiryTime, setOtpExpiryTime] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const {
    mutateAsync: sendOtp,
    isPending: isOtpPending,
    isError: isOtpError,
    error: otpError,
    isSuccess: isOtpSent,
    reset: resetOtpState,
  } = useSendOtp();

  const form = useForm({
    defaultValues: {
      name: user.name || "",
      email: user.email || "",
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const { handleSubmit, formState, watch } = form;
  const currentPassword = watch("currentPassword");
  const name = watch("name");
  const newPassword = watch("newPassword");
  const confirmNewPassword = watch("confirmNewPassword"); // Watch confirmNewPassword
  const isNameChanged = name !== (currentUser.name || "");
  const isNewPassword = !!newPassword;
  // Passwords must match or both be empty
  const passwordsMatch =
    (newPassword === "" && confirmNewPassword === "") ||
    (newPassword !== "" && newPassword === confirmNewPassword);
  const canSubmit =
    (isNameChanged || (isNewPassword && passwordsMatch)) &&
    !!currentPassword &&
    !formState.isSubmitting;

  // Countdown timer for OTP expiry
  useEffect(() => {
    if (!otpExpiryTime) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeRemaining = Math.max(
        0,
        Math.floor((otpExpiryTime.getTime() - now.getTime()) / 1000)
      );
      setTimeLeft(timeRemaining);

      if (timeRemaining <= 0) {
        clearInterval(interval);
        setOtpExpiryTime(null);
        setTimeLeft(0);
        resetOtpState();
        setOtp("");
        toast.error("OTP has expired. Please request a new one.");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [otpExpiryTime, resetOtpState]);

  // Cooldown timer for resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;

    const interval = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [resendCooldown]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const updateUserMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      currentPassword: string;
      newPassword: string;
      otp: string;
    }) => {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: isNameChanged ? data.name : currentUser.name,
          currentPassword: data.currentPassword,
          newPassword: isNewPassword ? data.newPassword : undefined,
          otp: data.otp,
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to update profile");
      return result;
    },
    onSuccess: (response) => {
      toast.success(response.message || "Profile updated successfully");
      form.reset({ ...form.getValues(), currentPassword: "", newPassword: "" });
      setOtp("");
      setOtpExpiryTime(null);
      setTimeLeft(0);
      setResendCooldown(0);
      resetOtpState();
      // Update the current user state with new name if it was changed
      if (isNameChanged) {
        setCurrentUser((prev) => ({ ...prev, name: form.getValues("name") }));
      }
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update profile");
    },
  });

  const onSubmit = (data: {
    name: string;
    currentPassword: string;
    newPassword: string;
  }) => {
    if (!isOtpSent) {
      sendOtp(currentUser.email || "").then(() => {
        const expiryTime = new Date();
        expiryTime.setMinutes(expiryTime.getMinutes() + 5);
        setOtpExpiryTime(expiryTime);
        setResendCooldown(30); // Start 30-second cooldown
      });
    } else {
      // If OTP is already sent, verify the OTP
      if (!otp.trim()) {
        toast.error("Please enter the OTP");
        return;
      }
      updateUserMutation.mutate({ ...data, otp });
    }
  };

  const handleVerifyOtp = () => {
    if (!otp.trim()) {
      toast.error("Please enter the OTP");
      return;
    }

    const formData = form.getValues();
    updateUserMutation.mutate({
      name: formData.name,
      currentPassword: formData.currentPassword,
      newPassword: formData.newPassword,
      otp,
    });
  };

  const handleResendOtp = () => {
    if (resendCooldown > 0) {
      toast.error("Please wait before requesting a new OTP");
      return;
    }

    sendOtp(currentUser.email || "").then(() => {
      const expiryTime = new Date();
      expiryTime.setMinutes(expiryTime.getMinutes() + 5);
      setOtpExpiryTime(expiryTime);
      setResendCooldown(30); // Start 30-second cooldown
      setOtp(""); // Clear the previous OTP input
    });
  };

  const handleImageUpdate = (newImageUrl: string) => {
    setCurrentUser((prev) => ({ ...prev, image: newImageUrl }));
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
  };

  return (
    <>
      <Toaster position="top-right" />

      {/* Profile Picture Upload Section */}
      <div className="flex gap-4">
        <div className="flex flex-col">
          <div className="mb-6">
            <ProfilePictureUpload
              userId={currentUser.id}
              currentImageUrl={currentUser.image}
              userName={currentUser.name || "User"}
              onImageUpdate={handleImageUpdate}
            />
          </div>
        </div>
        <div className="space-y-4">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label className="text-muted-foreground">Full name</Label>
                  <div className="col-span-2">
                    {currentUser.name || "Not provided"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label className="text-muted-foreground">Email address</Label>
                  <div className="col-span-2">
                    {currentUser.email || "Not provided"}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label className="text-muted-foreground">Verification</Label>
                  <div className="col-span-2">
                    {currentUser.emailVerified ? (
                      <Badge variant="secondary">Verified</Badge>
                    ) : (
                      <Badge variant="secondary">Unverified</Badge>
                    )}
                  </div>
                </div>
                {currentUser.isAdmin && (
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <Label className="text-muted-foreground">Role</Label>
                    <div className="col-span-2">
                      <Badge variant="secondary">Admin</Badge>
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label className="text-muted-foreground">
                    Account Status
                  </Label>
                  <div className="col-span-2">
                    <Badge variant="default">Active</Badge>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <Label className="text-muted-foreground">Subscription</Label>
                  <div className="col-span-2">
                    <Badge variant="default">Pro</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
            <div className="flex flex-col p-4 gap-2">
              <Button variant="secondary">
                <Link href="/billing">Manage Subscription</Link>
              </Button>
            </div>
          </Card>

          <Card className="w-full">
            <CardHeader>
              <CardTitle>Theme Preferences</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={theme}
                onValueChange={handleThemeChange}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label
                    htmlFor="light"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Sun className="h-4 w-4" />
                    Light
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label
                    htmlFor="dark"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Moon className="h-4 w-4" />
                    Dark
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="system" id="system" />
                  <Label
                    htmlFor="system"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Monitor className="h-4 w-4" />
                    System
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>
        <Card className="flex-1 h-full min-w-0">
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Update your name and profile. Enter your current password to
              confirm changes.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  name="name"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Full Name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Email"
                          type="email"
                          disabled
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="currentPassword"
                  control={form.control}
                  rules={{ required: "Current password is required" }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">Current Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Current Password"
                            type={showCurrentPassword ? "text" : "password"}
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                            onClick={() => setShowCurrentPassword((v) => !v)}
                          >
                            {showCurrentPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name="newPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">New Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="New Password (optional)"
                            type={showNewPassword ? "text" : "password"}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                            onClick={() => setShowNewPassword((v) => !v)}
                          >
                            {showNewPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Confirm New Password Field */}
                <FormField
                  name="confirmNewPassword"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="mb-2">
                        Confirm New Password
                      </FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            placeholder="Confirm New Password"
                            type={showConfirmNewPassword ? "text" : "password"}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            tabIndex={-1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground"
                            onClick={() => setShowConfirmNewPassword((v) => !v)}
                          >
                            {showConfirmNewPassword ? "Hide" : "Show"}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Show error if passwords do not match and both are non-empty */}
                {newPassword !== "" &&
                  confirmNewPassword !== "" &&
                  newPassword !== confirmNewPassword && (
                    <div className="text-destructive text-sm mt-2">
                      New Password and Confirm New Password do not match.
                    </div>
                  )}

                {/* OTP Section */}
                {isOtpSent && (
                  <div className="space-y-4 p-4 border rounded-lg bg-muted/50">
                    <div className="text-sm text-muted-foreground">
                      An OTP has been sent to your email address. Please enter
                      it below to verify your changes.
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        OTP expires in:
                      </span>
                      <span
                        className={`font-mono ${
                          timeLeft <= 60
                            ? "text-destructive"
                            : "text-foreground"
                        }`}
                      >
                        {formatTime(timeLeft)}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter OTP"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        maxLength={6}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        onClick={handleVerifyOtp}
                        disabled={
                          !otp.trim() ||
                          updateUserMutation.isPending ||
                          timeLeft <= 0
                        }
                      >
                        {updateUserMutation.isPending
                          ? "Verifying..."
                          : "Verify"}
                      </Button>
                    </div>
                    {timeLeft <= 0 && (
                      <div className="text-destructive text-sm">
                        OTP has expired. Please request a new one.
                      </div>
                    )}
                  </div>
                )}

                {!isOtpSent && (
                  <Button
                    className="mt-12"
                    type="submit"
                    disabled={
                      !canSubmit || isOtpPending || updateUserMutation.isPending
                    }
                  >
                    Save Changes
                  </Button>
                )}

                {/* Separate Resend Button */}
                {isOtpSent && (
                  <Button
                   
                    type="button"
                    variant="outline"
                    onClick={handleResendOtp}
                    disabled={isOtpPending || resendCooldown > 0}
                    className="mt-2 cursor-pointer"
                  >
                    {isOtpPending
                      ? "Sending..."
                      : resendCooldown > 0
                      ? `Resend OTP (${resendCooldown}s)`
                      : "Resend OTP"}
                  </Button>
                )}

                {(isOtpError || updateUserMutation.isError) && (
                  <div className="text-destructive text-sm mt-2">
                    {otpError?.message ||
                      updateUserMutation.error?.message ||
                      "Failed to update profile"}
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>

      {/* Sign Out Button - Fixed at bottom right */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          variant="destructive"
          onClick={() => signOut()}
          className="flex items-center gap-2 shadow-lg"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </>
  );
}

export default UserDetails;

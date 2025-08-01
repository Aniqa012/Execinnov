import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

interface UseSendOtpReturn {
  sendOtp: (email: string) => void;
  isPending: boolean;
  isError: boolean;
  error: Error | null;
  isOtpSent: boolean;
  resetOtpState: () => void;
}

export const useSendOtp = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      const res = await fetch(`/api/auth/verify?email=${encodeURIComponent(email)}`, {
        method: "GET",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || "Failed to send OTP");
      return result;
    },
    onSuccess: () => {
      toast.success("OTP sent to your email");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to send OTP");
    },
  });

 
}; 
"use client";

import { useQuery } from "@tanstack/react-query";

export interface ToolQuestion {
  id: string;
  question: string;
  answer: string;
  maxAnsLength: number;
}

export interface ToolDetail {
  id: string;
  title: string;
  description: string;
  systemInstructions: string;
  isPro: boolean;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  questions: ToolQuestion[];
  createdAt?: string;
  updatedAt?: string;
}

export function useToolDetail(toolId: string) {
  return useQuery({
    queryKey: ["tool", toolId],
    queryFn: async (): Promise<ToolDetail> => {
      const response = await fetch(`/api/tools/${toolId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch tool");
      }
      
      return response.json();
    },
    enabled: !!toolId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
} 
"use client";

import { Tool } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";


export interface ToolsResponse {
  tools: Tool[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalTools: number;
    hasMore: boolean;
    limit: number;
  };
}

interface UseToolsListParams {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  headers: Headers;
}

export function useToolsList({
  page = 1,
  limit = 12,
  category,
  search,
  headers,
}: UseToolsListParams) {
  return useQuery({
    queryKey: ["tools", { page, limit, category, search }],
    queryFn: async (): Promise<ToolsResponse> => {
      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", limit.toString());
      
      if (category) {
        params.set("category", category);
      }
      
      if (search) {
        params.set("search", search);
      }
      
      const response = await fetch(`/api/tools?${params.toString()}`, {headers: headers});
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch tools");
      }
      
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
} 
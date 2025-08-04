"use client";

import { useQuery } from "@tanstack/react-query";

export interface Category {
  id: string;
  name: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoriesResponse {
  categories: Category[];
}

export function useCategoriesList() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: async (): Promise<CategoriesResponse> => {
      const response = await fetch("/api/categories");
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch categories");
      }
      
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes (categories don't change often)
    retry: 1,
  });
} 
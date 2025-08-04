"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useCategoriesList, type Category } from "@/hooks/useCategoriesList";
import { useToolsList } from "@/hooks/useToolsList";
import { Tool } from "@/lib/types";
import { Search, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import { ToolsGrid } from "./ToolsGrid";
import { ToolsPagination } from "./ToolsPagination";

export function ToolsClient({headers}: {headers: Headers}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search term
  const debounceTimeout = useState<NodeJS.Timeout | null>(null)[0];

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearchTerm(value);
      if (debounceTimeout) clearTimeout(debounceTimeout);

      const timeout = setTimeout(() => {
        setDebouncedSearch(value);
        setCurrentPage(1); // Reset to first page when searching
      }, 500);

      return () => clearTimeout(timeout);
    },
    [debounceTimeout]
  );

  // Fetch tools
  const {
    data: toolsData,
    isLoading: toolsLoading,
    isError: toolsError,
    error: toolsErrorData,
    refetch: refetchTools,
  } = useToolsList({
    page: currentPage,
    limit: 12,
    headers: headers,
    category: selectedCategory || undefined,
    search: debouncedSearch || undefined,
  });

  // Fetch categories
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
  } = useCategoriesList();

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value === "all" ? "" : value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToolClick = (tool: Tool) => {
    // Navigate to the tool detail page or open tool
    router.push(`/tools/${tool.id}`);
  };

  return (
    <div className="container mx-auto px-4 ">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tools</h1>
            <p className="text-muted-foreground">
              Discover and use our collection of powerful AI tools to enhance your
              productivity.
            </p>
          </div>
          <Button
            onClick={() => router.push("/tools/create")}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create Tool
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Category Filter */}
        <div className="w-full md:w-64">
          {categoriesLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : categoriesError ? (
            <div className="text-sm text-red-600 flex items-center gap-2">
              <span>Failed to load categories</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <Select
              value={selectedCategory}
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categoriesData?.categories.map((category: Category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      {/* Tools Grid */}
      <ToolsGrid
        tools={toolsData?.tools || []}
        isLoading={toolsLoading}
        isError={toolsError}
        error={toolsErrorData}
        onRetry={refetchTools}
        onToolClick={handleToolClick}
      />

      {/* Pagination */}
      {toolsData && toolsData.pagination && (
        <ToolsPagination
          currentPage={toolsData.pagination.currentPage}
          totalPages={toolsData.pagination.totalPages}
          totalTools={toolsData.pagination.totalTools}
          hasMore={toolsData.pagination.hasMore}
          onPageChange={handlePageChange}
          isLoading={toolsLoading}
        />
      )}
    </div>
  );
}

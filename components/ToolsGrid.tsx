"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { Tool } from "@/lib/types";
import CustomToolCard from "./CustomToolCard";

interface ToolsGridProps {
  tools: Tool[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry?: () => void;
  onToolClick?: (tool: Tool) => void;
}

export function ToolsGrid({ 
  tools, 
  isLoading, 
  isError, 
  error, 
  onRetry, 
  onToolClick 
}: ToolsGridProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading tools...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <Card className="max-w-md mx-auto border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <div className="flex-1">
              <p className="text-red-800 font-medium">Error loading tools</p>
              <p className="text-red-600 text-sm">{error?.message || "Failed to load tools"}</p>
            </div>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry}>
                Retry
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (tools.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <p className="text-lg font-medium">No tools found</p>
          <p className="text-sm">Try adjusting your filters or search terms.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {tools.map((tool) => (
        <CustomToolCard 
          key={tool.id} 
          tool={tool} 
          onClick={onToolClick}
        />
      ))}
    </div>
  );
} 
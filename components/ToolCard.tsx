"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, ArrowRight } from "lucide-react";
import type { Tool } from "@/lib/types";

interface ToolCardProps {
  tool: Tool;
  onToolClick?: (tool: Tool) => void;
}

export function ToolCard({ tool, onToolClick }: ToolCardProps) {
  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg border-2 hover:border-primary/20">
      <CardHeader className="">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2 flex-1">
            <CardTitle className="text-lg font-semibold line-clamp-2 group-hover:text-primary transition-colors">
              {tool.title}
            </CardTitle>
            {tool.isPro && (
              <Badge variant="secondary" className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Crown className="w-3 h-3 mr-1" />
                Pro
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2 mt-2">
          {tool.category && (
            <Badge variant="outline" className="text-xs">
              {tool.category.name}
            </Badge>
          )}
          {tool.questionsCount > 0 && (
            <Badge variant="outline" className="text-xs">
              {tool.questionsCount} {tool.questionsCount === 1 ? "Question" : "Questions"}
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <CardDescription className="text-sm text-muted-foreground line-clamp-3 mb-6">
          {tool.description}
        </CardDescription>
        
        <Button 
          onClick={() => onToolClick?.(tool)}
          className="w-full group/btn transition-all duration-200 hover:shadow-md"
          size="sm"
        >
          <span className="mr-2">Use Tool</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1" />
        </Button>
      </CardContent>
    </Card>
  );
} 
"use client";

import { Badge } from "@/components/ui/badge";
import { Crown, ArrowLeft, Calendar, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import type { ToolDetail } from "@/hooks/useToolDetail";

interface ToolDetailHeaderProps {
  tool: ToolDetail;
}

export function ToolDetailHeader({ tool }: ToolDetailHeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  return (
    <div className="space-y-4 px-2">
      {/* Back Navigation */}
      <Button
       variant={"ghost"}
        onClick={handleBack}
        className="flex items-center gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tools
      </Button>

      {/* Tool Header Card */}
      
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-3xl font-bold">{tool.title}</h1>
                {tool.isPro && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Crown className="w-3 h-3 mr-1" />
                    Pro
                  </Badge>
                )}
              </div>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                {tool.description}
              </p>
            </div>
          </div>
      
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {tool.category && (
              <div className="flex items-center gap-2">
                <Tag className="w-4 h-4" />
                <span>Category:</span>
                <Badge variant="outline">{tool.category.name}</Badge>
              </div>
            )}
            
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>Questions:</span>
              <Badge variant="outline">
                {tool.questions.length} {tool.questions.length === 1 ? "Question" : "Questions"}
              </Badge>
            </div>
            
            {tool.createdAt && (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Created:</span>
                <span>{new Date(tool.createdAt).toLocaleDateString()}</span>
              </div>
            )}
          </div>
      
    </div>
  );
} 
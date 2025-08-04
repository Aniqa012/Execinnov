"use client";
import { useParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToolDetail } from "@/hooks/useToolDetail";
import { ToolDetailHeader } from "@/components/ToolDetailHeader";
import { ToolQuestionsForm, type FormData } from "@/components/ToolQuestionsForm";
import { AiInterface } from "@/components/AiInterface";
import { useAgentMutation, type AgentQuestion } from "@/hooks/useAgentMutation";

export default function ToolDetailPage() {
  const params = useParams();
  const toolId = params?.id as string;
  


  const {
    data: tool,
    isLoading,
    isError,
    error,
    refetch,
  } = useToolDetail(toolId);

  const agentMutation = useAgentMutation();

  const handleFormSubmit = async (formData: FormData) => {
    if (!tool) return;

    // Transform form data to match API requirements and validate
    const questions: AgentQuestion[] = tool.questions
      .filter(q => formData[q.id] && formData[q.id].trim())
      .map(q => ({
        question: q.question,
        answer: formData[q.id].trim(),
      }));

    try {
      await agentMutation.mutateAsync({
        toolId,
        questions,
      });
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('Submission failed:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading tool details...</p>
        </div>
      </div>
    );
  }

  if (isError || !tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-red-800 font-medium">Error loading tool</p>
                <p className="text-red-600 text-sm">
                  {error?.message || "Failed to load tool details"}
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => refetch()}
                className="flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!tool.isActive) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="text-center py-4">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-amber-500" />
              <p className="text-amber-800 font-medium">Tool Not Available</p>
              <p className="text-amber-600 text-sm mt-1">
                This tool is currently inactive or unavailable.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className=" px-20 py-16 fixed inset-0 flex flex-col bg-background">
      {/* Tool Header */}
      <ToolDetailHeader tool={tool} />
      {/* Main Content */}
      <div className="flex-1 grid lg:grid-cols-2 gap-8 mt-8 overflow-hidden">
        {/* Left Side - Questions Form */}
        <div className="h-full max-h-full overflow-y-auto pr-2">
          <ToolQuestionsForm
            questions={tool.questions}
            onSubmit={handleFormSubmit}
            isLoading={agentMutation.isPending}
            error={agentMutation.error?.message || null}
          />
        </div>
        {/* Right Side - AI Interface */}
        <div className="h-full max-h-full overflow-y-auto pl-2">
          <AiInterface 
            isLoading={agentMutation.isPending}
            response={agentMutation.data?.response}
            error={agentMutation.error?.message || null}
          />
        </div>
      </div>
    </div>
  );
} 
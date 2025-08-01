"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedLoader from "@/components/ui/DottedLoader";
import { Separator } from "@/components/ui/separator";
import MarkdownEditor from "@uiw/react-markdown-editor";
import MarkdownPreview from "@uiw/react-markdown-preview";
import { AlertCircle, Bot, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

interface AiInterfaceProps {
  isLoading?: boolean;
  response?: string;
  error?: string | null;
  hasStarted?: boolean;
}

export function AiInterface({
  isLoading = false,
  response,
  error,
}: AiInterfaceProps) {
  // Always call hooks at the top level
  const [editableResponse, setEditableResponse] = useState(response);
  const [isEditing, setIsEditing] = useState(false);
  useEffect(() => {
    setEditableResponse(response);
    setIsEditing(false);
  }, [response]);

  // Loading state
  if (isLoading) {
    return (
      <Card className="h-full min-h-[400px] bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <Bot className="w-5 h-5" />
            AI Interface
            <Badge
              variant="secondary"
              className="ml-auto bg-blue-100 text-blue-700"
            >
              Processing
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <div className="text-center space-y-4 max-w-sm">
            <h3 className="text-lg font-semibold text-blue-700 mb-6">AI is thinking</h3>
            <div className="flex justify-center">
              <DottedLoader />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (error) {
    return (
      <Card className="h-full min-h-[400px] bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <Bot className="w-5 h-5" />
            AI Interface
            <Badge variant="destructive" className="ml-auto">
              <AlertCircle className="w-3 h-3 mr-1" />
              Error
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-full py-12">
          <div className="text-center space-y-4 max-w-sm">
            <div className="relative">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <div className="absolute inset-0 bg-gradient-to-r from-red-400/20 to-rose-400/20 rounded-full blur-xl"></div>
            </div>
            <h3 className="text-lg font-semibold text-red-700">
              Processing Failed
            </h3>
            <p className="text-sm text-red-600/70 leading-relaxed">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Success state with response
  if (response) {
    return (
      <Card className="h-full min-h-[400px] bg-gradient-to-br from-green-50 to-emerald-50 border-green-200 flex flex-col">
        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
          <div className="space-y-3 flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-green-600" />
              <h3 className="font-semibold text-green-800">AI Response</h3>
              {!isEditing && (
                <button
                  className="ml-auto px-3 py-1 rounded bg-green-100 text-green-700 border border-green-300 hover:bg-green-200 transition"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
              )}
            </div>
            <Separator className="bg-green-200" />
            <div className="prose prose-sm max-w-none flex-1 flex flex-col min-h-0">
              {!isEditing ? (
                <div className="bg-white/50 rounded-lg p-4 border border-green-200 flex-1 min-h-0 overflow-y-auto">
                  <MarkdownPreview
                    source={editableResponse}
                    wrapperElement={{ "data-color-mode": "light" }}
                  />
                </div>
              ) : (
                <div>
                  <MarkdownEditor
                    data-color-mode={"light"}
                    className="flex flex-col h-full"
                    value={editableResponse}
                    onChange={setEditableResponse}
                    height="100%"
                    style={{
                      background: "transparent",
                      minHeight: 0,
                      height: "100%",
                    }}
                  />
                  <button
                    className="mt-4 self-end px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700 transition"
                    onClick={() => setIsEditing(false)}
                  >
                    Save
                  </button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default state
  return (
    <Card className="h-full min-h-[400px] bg-gradient-to-br from-slate-50 to-slate-100 border-dashed border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-muted-foreground">
          <Bot className="w-5 h-5" />
          AI Interface
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center h-full py-12">
        <div className="text-center space-y-4 max-w-sm">
          <div className="relative">
            <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-xl"></div>
          </div>
          <h3 className="text-lg font-semibold text-muted-foreground">
            AI Interface
          </h3>
          <p className="text-sm text-muted-foreground/70 leading-relaxed">
            &quot;Fill out the questions on the left and click
            &apos;Generate&apos; to get AI-powered insights.&quot;
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

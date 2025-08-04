"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Loader2, AlertCircle } from "lucide-react";
import type { ToolQuestion } from "@/hooks/useToolDetail";

// Create dynamic schema based on questions
const createFormSchema = (questions: ToolQuestion[]) => {
  const schemaFields: Record<string, z.ZodString> = {};
  
  questions.forEach((question) => {
    schemaFields[question.id] = z
      .string()
      .min(1, "Answer is required")
      .max(question.maxAnsLength, `Answer must be less than ${question.maxAnsLength} characters`);
  });
  
  return z.object(schemaFields);
};

export type FormData = Record<string, string>;

interface ToolQuestionsFormProps {
  questions: ToolQuestion[];
  onSubmit: (data: FormData) => void;
  isLoading?: boolean;
  error?: string | null;
}

export function ToolQuestionsForm({ 
  questions, 
  onSubmit, 
  isLoading = false,
  error = null 
}: ToolQuestionsFormProps) {
  const formSchema = createFormSchema(questions);
  
  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
    watch,
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: questions.reduce((acc, question) => ({
      ...acc,
      [question.id]: "",
    }), {}),
  });

  const watchedValues = watch();

  const handleFormSubmit = (data: FormData) => {
    onSubmit(data);
  };

  const handleReset = () => {
    reset();
  };

  if (questions.length === 0) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="text-center py-8 text-muted-foreground">
            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
            <p>No questions available for this tool.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full min-h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5" />
          Answer the Questions
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 flex flex-col min-h-0 ">
          <div className="flex-1 min-h-0 overflow-y-auto space-y-6 pb-4 pr-4">
            {questions.map((question, index) => {
              const currentValue = watchedValues[question.id] || "";
              const remainingChars = question.maxAnsLength - currentValue.length;
              const isOverLimit = remainingChars < 0;
              return (
                <div key={question.id} className="space-y-3">
                  <div className="flex items-start justify-between">
                    <Label htmlFor={question.id} className="text-base font-medium leading-relaxed">
                      <span className="inline-flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          Question {index + 1}
                        </Badge>
                        {isOverLimit && (
                          <Badge variant="destructive" className="text-xs">
                            Over limit
                          </Badge>
                        )}
                      </span>
                      <div className="text-sm font-normal text-foreground">
                        {question.question}
                      </div>
                    </Label>
                  </div>
                  <Controller
                    name={question.id}
                    control={control}
                    render={({ field }) => (
                      <div className="relative">
                        <Textarea
                          {...field}
                          id={question.id}
                          placeholder="Type your answer here..."
                          className={`min-h-[120px] resize-y ${
                            errors[question.id] ? "border-red-500 focus:ring-red-500" : ""
                          } ${isOverLimit ? "border-red-500" : ""}`}
                          disabled={isLoading}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <div className="text-xs text-muted-foreground">
                            {errors[question.id] && (
                              <span className="text-red-500">{errors[question.id]?.message}</span>
                            )}
                          </div>
                          <div className={`text-xs ${
                            isOverLimit ? "text-red-500" : remainingChars < 50 ? "text-amber-500" : "text-muted-foreground"
                          }`}>
                            {remainingChars >= 0 ? remainingChars : 0} characters remaining
                          </div>
                        </div>
                      </div>
                    )}
                  />
                </div>
              );
            })}
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">Error</span>
                </div>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            )}
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={!isValid || isLoading}
              className="flex items-center gap-2 flex-1"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isLoading}
              size="lg"
            >
              Reset
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 
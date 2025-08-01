"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, ArrowLeft } from "lucide-react";

const questionSchema = z.object({
  question: z.string().min(1, "Question is required").trim(),
  maxAnsLength: z.number().min(1, "Max answer length must be at least 1").max(5000, "Max answer length cannot exceed 5000").default(600),
});

const createToolSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  systemInstructions: z.string().min(1, "System instructions are required").trim(),
  questions: z.array(questionSchema).min(1, "At least one question is required"),
  isPro: z.boolean().default(false),
  isActive: z.boolean().default(true),
  category: z.string().min(1, "Category is required"),
});

type CreateToolData = z.infer<typeof createToolSchema>;
type Question = {
  question: string;
  maxAnsLength: number;
};

interface Category {
  _id: string;
  name: string;
  isActive: boolean;
}

interface AddToolFormProps {
  categories: Category[];
}

export default function AddToolForm({ categories }: AddToolFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<CreateToolData>({
    title: "",
    description: "",
    systemInstructions: "",
    questions: [{ question: "", maxAnsLength: 600 }],
    isPro: false,
    isActive: true,
    category: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createToolMutation = useMutation({
    mutationFn: async (data: CreateToolData) => {
      const response = await fetch("/api/tools", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create tool");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Tool "${data.title}" created successfully!`);
      router.push("/admin/tools");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create tool");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = createToolSchema.safeParse(formData);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        const path = issue.path.join(".");
        newErrors[path] = issue.message;
      });
      setErrors(newErrors);
      return;
    }

    createToolMutation.mutate(validation.data);
  };

  const handleInputChange = (field: keyof CreateToolData) => (
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, { question: "", maxAnsLength: 600 }],
    }));
  };

  const removeQuestion = (index: number) => {
    // Prevent removing the last question - at least one is required
    if (formData.questions.length <= 1) {
      return;
    }
    
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index),
    }));
  };

  const updateQuestion = (index: number, field: keyof Question, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      ),
    }));
    
    // Clear error for this question field
    const errorKey = `questions.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => ({ ...prev, [errorKey]: "" }));
    }
  };

  const activeCategories = categories.filter(cat => cat.isActive);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Tools
        </Button>
        <h1 className="text-3xl font-bold">Add New Tool</h1>
        <p className="text-muted-foreground">
          Create a new tool with questions and configurations
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Fill in the basic details about your tool
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Tool Title</Label>
              <Input
                id="title"
                placeholder="Enter tool title"
                value={formData.title}
                onChange={(e) => handleInputChange("title")(e.target.value)}
                disabled={createToolMutation.isPending}
                className={errors.title ? "border-red-500" : ""}
              />
              {errors.title && (
                <p className="text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this tool does"
                value={formData.description}
                onChange={(e) => handleInputChange("description")(e.target.value)}
                disabled={createToolMutation.isPending}
                className={errors.description ? "border-red-500" : ""}
                rows={3}
              />
              {errors.description && (
                <p className="text-sm text-red-600">{errors.description}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="systemInstructions">System Instructions</Label>
              <Textarea
                id="systemInstructions"
                placeholder="Enter LLM system instructions for this tool"
                value={formData.systemInstructions}
                onChange={(e) => handleInputChange("systemInstructions")(e.target.value)}
                disabled={createToolMutation.isPending}
                className={errors.systemInstructions ? "border-red-500" : ""}
                rows={4}
              />
              {errors.systemInstructions && (
                <p className="text-sm text-red-600">{errors.systemInstructions}</p>
              )}
              <p className="text-sm text-muted-foreground">
                Provide system instructions that will guide the AI when using this tool. This helps define the AI&apos;s behavior and response style.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => handleInputChange("category")(value)}
                disabled={createToolMutation.isPending}
              >
                <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {activeCategories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isPro"
                  checked={formData.isPro}
                  onCheckedChange={(checked) =>
                    handleInputChange("isPro")(checked === true)
                  }
                  disabled={createToolMutation.isPending}
                />
                <Label htmlFor="isPro" className="text-sm font-medium">
                  Pro Feature
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange("isActive")(checked === true)
                  }
                  disabled={createToolMutation.isPending}
                />
                <Label htmlFor="isActive" className="text-sm font-medium">
                  Active (visible to users)
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Questions</CardTitle>
                <CardDescription>
                  Add questions that users will answer when using this tool.
                </CardDescription>
              </div>
              <Button
                type="button"
                onClick={addQuestion}
                disabled={createToolMutation.isPending}
                size="sm"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Question
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {errors.questions && (
              <p className="text-sm text-red-600 mb-4">{errors.questions}</p>
            )}
            {formData.questions.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No questions added yet. Click &quot;Add Question&quot; to get started.
              </p>
            ) : (
              <div className="space-y-4">
                {formData.questions.map((question, index) => (
                  <Card key={index} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Question {index + 1}</h4>
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeQuestion(index)}
                          disabled={createToolMutation.isPending || formData.questions.length <= 1}
                          title={formData.questions.length <= 1 ? "At least one question is required" : "Remove question"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`question-${index}`}>Question</Label>
                          <Input
                            id={`question-${index}`}
                            placeholder="Enter the question"
                            value={question.question}
                            onChange={(e) => updateQuestion(index, "question", e.target.value)}
                            disabled={createToolMutation.isPending}
                            className={errors[`questions.${index}.question`] ? "border-red-500" : ""}
                          />
                          {errors[`questions.${index}.question`] && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors[`questions.${index}.question`]}
                            </p>
                          )}
                        </div>

                        <div>
                          <Label htmlFor={`maxLength-${index}`}>Max Answer Length</Label>
                          <Input
                            id={`maxLength-${index}`}
                            type="number"
                            min={1}
                            max={5000}
                            value={question.maxAnsLength}
                            onChange={(e) => updateQuestion(index, "maxAnsLength", parseInt(e.target.value) || 600)}
                            disabled={createToolMutation.isPending}
                            className={errors[`questions.${index}.maxAnsLength`] ? "border-red-500" : ""}
                          />
                          {errors[`questions.${index}.maxAnsLength`] && (
                            <p className="text-sm text-red-600 mt-1">
                              {errors[`questions.${index}.maxAnsLength`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={createToolMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createToolMutation.isPending}
          >
            {createToolMutation.isPending ? "Creating Tool..." : "Create Tool"}
          </Button>
        </div>
      </form>
    </div>
  );
} 
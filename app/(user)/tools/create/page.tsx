"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useCategoriesList } from "@/hooks/useCategoriesList";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

const createToolSchema = z.object({
  title: z.string().min(1, "Title is required").trim(),
  description: z.string().min(1, "Description is required").trim(),
  expectations: z.string().min(1, "Expectations are required").trim(),
  categoryId: z.string().min(1, "Category is required"),
});

type CreateToolData = z.infer<typeof createToolSchema>;

export default function CreateToolPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: categoriesData, isLoading: categoriesLoading } = useCategoriesList();
  
  const [formData, setFormData] = useState<CreateToolData>({
    title: "",
    description: "",
    expectations: "",
    categoryId: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Mutation for creating tool
  const createToolMutation = useMutation({
    mutationFn: async (data: CreateToolData) => {
      const response = await fetch("/api/agent/create-tool", {
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
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      router.push("/tools");
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
    value: string
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  if (categoriesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const categories = categoriesData?.categories || [];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create Custom Tool</h1>
          <p className="text-muted-foreground">
            Create your own AI tool with custom instructions and questions
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
          {/* Basic Information Card */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Provide the essential details for your tool
              </CardDescription>
            </CardHeader>
                         <CardContent className="space-y-4 flex-1 flex flex-col">
               <div className="space-y-2">
                 <Label htmlFor="title">Title *</Label>
                 <Input
                   id="title"
                   placeholder="Enter tool title"
                   value={formData.title}
                   onChange={(e) => handleInputChange("title")(e.target.value)}
                   className={errors.title ? "border-red-500" : ""}
                 />
                 {errors.title && (
                   <p className="text-sm text-red-500">{errors.title}</p>
                 )}
               </div>

                               <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Input
                    id="description"
                    placeholder="Describe what your tool does"
                    value={formData.description}
                    onChange={(e) => handleInputChange("description")(e.target.value)}
                    className={errors.description ? "border-red-500" : ""}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500">{errors.description}</p>
                  )}
                </div>

               <div className="space-y-2">
                 <Label htmlFor="category">Category *</Label>
                 <Select
                   value={formData.categoryId}
                   onValueChange={(value) => handleInputChange("categoryId")(value)}
                 >
                   <SelectTrigger className={errors.categoryId ? "border-red-500" : ""}>
                     <SelectValue placeholder="Select a category" />
                   </SelectTrigger>
                   <SelectContent>
                     {categories.map((category) => (
                       <SelectItem key={category.id} value={category.id}>
                         {category.name}
                       </SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                 {errors.categoryId && (
                   <p className="text-sm text-red-500">{errors.categoryId}</p>
                 )}
               </div>
             </CardContent>
          </Card>

          {/* Expectations Card */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Expectations</CardTitle>
              <CardDescription>
                Describe what you expect from this tool and its purpose
              </CardDescription>
            </CardHeader>
                         <CardContent className="flex-1 flex flex-col">
               <div className="space-y-2 flex-1 flex flex-col">
                 <Label htmlFor="expectations">Expectations *</Label>
                 <Textarea
                   id="expectations"
                   placeholder="Describe what you expect from this tool, its purpose, and any specific requirements..."
                   value={formData.expectations}
                   onChange={(e) => handleInputChange("expectations")(e.target.value)}
                   className={`flex-1 min-h-0 ${errors.expectations ? "border-red-500" : ""}`}
                 />
                 {errors.expectations && (
                   <p className="text-sm text-red-500">{errors.expectations}</p>
                 )}
               </div>
             </CardContent>
          </Card>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-4 mt-8">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={createToolMutation.isPending}
            className="flex items-center gap-2"
          >
            {createToolMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            {createToolMutation.isPending ? "Creating..." : "Create Tool"}
          </Button>
        </div>
      </form>
    </div>
  );
}

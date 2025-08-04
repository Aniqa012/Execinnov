"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const updateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
  isActive: z.boolean(),
});

type UpdateCategoryData = z.infer<typeof updateCategorySchema>;

interface Category {
  id: string;
  name: string;
  isActive: boolean;
}

interface EditCategoryModalProps {
  category: Category | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EditCategoryModal({ category, open, onOpenChange }: EditCategoryModalProps) {
  const [formData, setFormData] = useState<UpdateCategoryData>({
    name: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  // Update form data when category changes
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        isActive: category.isActive,
      });
    }
  }, [category]);

  const updateCategoryMutation = useMutation({
    mutationFn: async (data: UpdateCategoryData) => {
      if (!category) throw new Error("No category selected");
      
      const response = await fetch(`/api/categories/${category.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update category");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" updated successfully!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update category");
    },
  });

  const resetForm = () => {
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = updateCategorySchema.safeParse(formData);
    
    if (!validation.success) {
      const newErrors: Record<string, string> = {};
      validation.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          newErrors[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(newErrors);
      return;
    }

    updateCategoryMutation.mutate(validation.data);
  };

  const handleInputChange = (field: keyof UpdateCategoryData) => (
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category details. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Category Name</Label>
            <Input
              id="name"
              placeholder="Enter category name"
              value={formData.name}
              onChange={(e) => handleInputChange("name")(e.target.value)}
              disabled={updateCategoryMutation.isPending}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isActive"
              checked={formData.isActive}
              onCheckedChange={(checked) =>
                handleInputChange("isActive")(checked === true)
              }
              disabled={updateCategoryMutation.isPending}
            />
            <Label
              htmlFor="isActive"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Active (visible to users)
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                resetForm();
              }}
              disabled={updateCategoryMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={updateCategoryMutation.isPending}
            >
              {updateCategoryMutation.isPending ? "Updating..." : "Update Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
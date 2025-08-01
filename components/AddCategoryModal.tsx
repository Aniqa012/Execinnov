"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-hot-toast";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus } from "lucide-react";


const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
  isActive: z.boolean().default(true),
});

type CreateCategoryData = z.infer<typeof createCategorySchema>;

interface AddCategoryModalProps {
  trigger?: React.ReactNode;
}

export default function AddCategoryModal({ trigger }: AddCategoryModalProps) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<CreateCategoryData>({
    name: "",
    isActive: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const queryClient = useQueryClient();

  const {isPending, mutate: createCategory} = useMutation({
    mutationFn: async (data: CreateCategoryData) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create category");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(`Category "${data.name}" created successfully!`);
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      
      setOpen(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create category");
    },
  });

  const resetForm = () => {
    setFormData({ name: "", isActive: true });
    setErrors({});
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validation = createCategorySchema.safeParse(formData);
    
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

    createCategory(validation.data);
  };

  const handleInputChange = (field: keyof CreateCategoryData) => (
    value: string | boolean
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Category</DialogTitle>
          <DialogDescription>
            Create a new category for organizing your tools. Click save when you&apos;re done.
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
              disabled={isPending}
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
              disabled={isPending}
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
                setOpen(false);
                resetForm();
              }}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
            >
              {isPending ? "Creating..." : "Create Category"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
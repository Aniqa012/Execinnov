"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import DeleteConfirmModal from "./DeleteConfirmModal";

interface Tool {
  id: string;
  title: string;
  description: string;
  systemInstructions?: string;
  isPro: boolean;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  } | null;
  questionsCount: number;
  createdAt?: string;
  updatedAt?: string;
}

interface ToolsTableProps {
  tools: Tool[];
}

export default function ToolsTable({ tools }: ToolsTableProps) {
  const [deletingTool, setDeletingTool] = useState<Tool | null>(null);
  const queryClient = useQueryClient();
  const router = useRouter();

  const deleteToolMutation = useMutation({
    mutationFn: async (toolId: string) => {
      const response = await fetch(`/api/tools/${toolId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete tool");
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success("Tool deleted successfully!");
      queryClient.invalidateQueries({ queryKey: ["tools"] });
      setDeletingTool(null);
      // Refresh the page to update the server component data
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete tool");
    },
  });

  const handleEdit = (tool: Tool) => {
    router.push(`/admin/tools/${tool.id}`);
  };

  const handleDelete = (tool: Tool) => {
    setDeletingTool(tool);
  };

  const confirmDelete = () => {
    if (deletingTool) {
      deleteToolMutation.mutate(deletingTool.id);
    }
  };

  return (
    <>
      <div className="rounded-md border">
        <Table className="">
          <TableHeader className="">
            <TableRow>
              <TableHead >Title</TableHead>
              <TableHead >Category</TableHead>
              <TableHead >Questions</TableHead>
              <TableHead >Type</TableHead>
              <TableHead >Status</TableHead>
              <TableHead >Created At</TableHead>
              <TableHead className=" text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tools.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-muted-foreground px-4 py-2">
                  No tools found.
                </TableCell>
              </TableRow>
            ) : (
              tools.map((tool, idx) => {
                const isLast = idx === tools.length - 1;
                return (
                  <TableRow key={tool.id}>
                    <TableCell className={`px-4 py-2${isLast ? ' pb-4 pl-6' : ' pl-6'}`}> {/* bottom-left corner */}
                      <div>
                        <div className="font-medium">{tool.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {tool.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="px-4 py-2">{tool.category?.name || 'N/A'}</TableCell>
                    <TableCell className="px-4 py-2">{tool.questionsCount || 0}</TableCell>
                    <TableCell className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.isPro 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {tool.isPro ? 'Pro' : 'Free'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tool.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tool.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-2">
                      {tool.createdAt 
                        ? new Date(tool.createdAt).toLocaleDateString() 
                        : 'N/A'}
                    </TableCell>
                    <TableCell className={`px-4 py-2 text-right${isLast ? ' pb-4 pr-6' : ' pr-6'}`}> {/* bottom-right corner */}
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(tool)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(tool)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <DeleteConfirmModal
        open={!!deletingTool}
        onOpenChange={(open) => {
          if (!open) setDeletingTool(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Tool"
        description="Are you sure you want to delete this tool? This action cannot be undone."
        itemName={deletingTool?.title}
        isLoading={deleteToolMutation.isPending}
      />
    </>
  );
} 
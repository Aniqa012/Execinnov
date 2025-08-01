"use client"

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Eye, EyeOff, Key } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

type AdminUser = {
  _id: string;
  name: string;
  email: string;
  image: string;
  isAdmin: boolean;
  createdAt: string;
  updatedAt: string;
};

const createAdminSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(4, "Password must be at least 4 characters"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(4, "Password must be at least 4 characters"),
});

type CreateAdminFormData = z.infer<typeof createAdminSchema>;
type UpdatePasswordFormData = z.infer<typeof updatePasswordSchema>;

// API functions
const fetchAdminUsers = async (): Promise<AdminUser[]> => {
  const response = await fetch("/api/users?type=admin");
  if (!response.ok) {
    throw new Error("Failed to fetch admin users");
  }
  const data = await response.json();
  return data.users || [];
};

const createAdminUser = async (userData: CreateAdminFormData & { isAdmin: boolean }) => {
  const response = await fetch("/api/users/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to create admin user");
  }

  return response.json();
};

const updateUserPassword = async ({ userId, password }: { userId: string; password: string }) => {
  const response = await fetch(`/api/users/${userId}/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || "Failed to update password");
  }

  return response.json();
};

export default function AdminUsersClient() {
  const queryClient = useQueryClient();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);
  const [showUpdatePassword, setShowUpdatePassword] = useState(false);

  // Query for fetching admin users
  const {
    data: adminUsers = [],
    isLoading,
    error,
    isError
  } = useQuery({
    queryKey: ["admin-users"],
    queryFn: fetchAdminUsers,
  });

  // Mutation for creating admin user
  const createAdminMutation = useMutation({
    mutationFn: createAdminUser,
    onSuccess: (data) => {
      toast.success(data.message || "Admin user created successfully");
      setCreateDialogOpen(false);
      createForm.reset();
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create admin user");
    },
  });

  // Mutation for updating password
  const updatePasswordMutation = useMutation({
    mutationFn: updateUserPassword,
    onSuccess: (data) => {
      toast.success(data.message || "Password updated successfully");
      setPasswordDialogOpen(false);
      passwordForm.reset();
      setSelectedUserId("");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to update password");
    },
  });

  const createForm = useForm<CreateAdminFormData>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const passwordForm = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const onCreateAdmin = (data: CreateAdminFormData) => {
    createAdminMutation.mutate({
      ...data,
      isAdmin: true,
    });
  };

  const onUpdatePassword = (data: UpdatePasswordFormData) => {
    updatePasswordMutation.mutate({
      userId: selectedUserId,
      password: data.password,
    });
  };

  const openPasswordDialog = (userId: string) => {
    setSelectedUserId(userId);
    setPasswordDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading admin users...</div>;
  }

  if (isError) {
    return (
      <div className="flex flex-col justify-center items-center h-64 space-y-4">
        <p className="text-red-600">Error loading admin users: {error?.message}</p>
        <Button onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-users"] })}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Total Admin Users: {adminUsers.length}
          </p>
        </div>
        
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button disabled={createAdminMutation.isPending}>
              <Plus className="mr-2 h-4 w-4" />
              {createAdminMutation.isPending ? "Creating..." : "Create New Admin"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Admin User</DialogTitle>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateAdmin)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} disabled={createAdminMutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="admin@example.com" {...field} disabled={createAdminMutation.isPending} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={createForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type={showPassword ? "text" : "password"} 
                            placeholder="Password" 
                            {...field} 
                            disabled={createAdminMutation.isPending}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={createAdminMutation.isPending}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setCreateDialogOpen(false)}
                    disabled={createAdminMutation.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createAdminMutation.isPending}>
                    {createAdminMutation.isPending ? "Creating..." : "Create Admin"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {adminUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No admin users found
                </TableCell>
              </TableRow>
            ) : (
              adminUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.image} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="bg-green-100 text-green-800">
                      Admin
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-gray-500">
                    {formatDate(user.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openPasswordDialog(user._id)}
                      disabled={updatePasswordMutation.isPending}
                    >
                      <Key className="mr-2 h-4 w-4" />
                      {updatePasswordMutation.isPending && selectedUserId === user._id ? "Updating..." : "Change Password"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Update Password Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Admin Password</DialogTitle>
          </DialogHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onUpdatePassword)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type={showUpdatePassword ? "text" : "password"} 
                          placeholder="New password" 
                          {...field} 
                          disabled={updatePasswordMutation.isPending}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowUpdatePassword(!showUpdatePassword)}
                          disabled={updatePasswordMutation.isPending}
                        >
                          {showUpdatePassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPasswordDialogOpen(false);
                    passwordForm.reset();
                    setSelectedUserId("");
                  }}
                  disabled={updatePasswordMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={updatePasswordMutation.isPending}>
                  {updatePasswordMutation.isPending ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
} 
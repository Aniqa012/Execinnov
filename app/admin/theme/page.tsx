"use client";
import { Button } from "@/components/ui/button";
import {
  CardFooter
} from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { useForm } from "react-hook-form";
import toast, { Toaster } from "react-hot-toast";
import { z } from "zod";

const themeSchema = z.object({
  customPrimary: z.string().min(1),
  customSecondary: z.string().min(1),
  customTertiary: z.string().min(1),
});
type ThemeForm = z.infer<typeof themeSchema>;

const fetchTheme = async (): Promise<ThemeForm> => {
  const res = await fetch("/api/theme");
  const data = await res.json();
  if (!data.success) throw new Error("Failed to fetch theme");
  return data.data;
};

const updateTheme = async (values: ThemeForm): Promise<ThemeForm> => {
  const res = await fetch("/api/theme", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(values),
  });
  const data = await res.json();
  if (!data.success) throw new Error("Failed to update theme");
  // Update CSS variables immediately
  document.documentElement.style.setProperty("--custom-primary", data.data.customPrimary);
  document.documentElement.style.setProperty("--custom-secondary", data.data.customSecondary);
  document.documentElement.style.setProperty("--custom-tertiary", data.data.customTertiary);
  window.dispatchEvent(new CustomEvent("theme-updated"));
  return data.data;
};

export default function AdminThemePage() {
  const queryClient = useQueryClient();
  const {
    data: theme,
    isLoading,
    isError,
    error,
  } = useQuery<ThemeForm, Error>({
    queryKey: ["admin-theme"],
    queryFn: fetchTheme,
  });

  const mutation = useMutation<ThemeForm, Error, ThemeForm>({
    mutationFn: updateTheme,
    onSuccess: () => {
      toast.success("Theme colors updated successfully.");
      queryClient.invalidateQueries({ queryKey: ["admin-theme"] });
    },
    onError: (err) => {
      toast.error(err.message || "Failed to update theme colors");
    },
  });

  const form = useForm<ThemeForm>({
    resolver: zodResolver(themeSchema),
    defaultValues: {
      customPrimary: "#000000",
      customSecondary: "#ffffff",
      customTertiary: "#000000",
    },
    values: theme,
    mode: "onChange",
  });

  // Sync form with fetched theme
  React.useEffect(() => {
    if (theme) {
      form.reset(theme);
    }
  }, [theme, form]);

  return (
    <div className="max-w-xl mx-auto p-8">
      <Toaster position="top-right" />
      <div>
        <h1 className="text-2xl font-bold mb-6">Admin Theme Configuration</h1>
        <p className="text-sm text-muted-foreground mb-6">Configure the three custom background colors for your app.</p>
        <div>
          {isLoading ? (
            <div className="text-center py-8">Loading theme colors...</div>
          ) : isError ? (
            <div className="text-center text-red-600 py-8">
              Error loading theme: {error?.message}
              <Button variant="outline" className="ml-4" onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-theme"] })}>
                Retry
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="customPrimary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Primary Background</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} value={field.value} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customSecondary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Secondary Background</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} value={field.value} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="customTertiary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Tertiary Background</FormLabel>
                      <FormControl>
                        <Input type="color" {...field} value={field.value} className="w-12 h-12 p-0 border-none bg-transparent cursor-pointer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <CardFooter className="px-0">
                  <Button type="submit" disabled={mutation.isPending}>
                    {mutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </CardFooter>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
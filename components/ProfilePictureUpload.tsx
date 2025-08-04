"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Camera, Upload, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

interface ProfilePictureUploadProps {
  userId: string;
  currentImageUrl?: string;
  userName?: string;
  onImageUpdate?: (newImageUrl: string) => void;
}

export default function ProfilePictureUpload({
  userId,
  currentImageUrl = "/media/avatar.avif",
  userName = "User",
  onImageUpdate,
}: ProfilePictureUploadProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to upload profile picture");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Profile picture updated successfully");
      onImageUpdate?.(data.imageUrl);
      setIsDialogOpen(false);
      setPreviewUrl(null);
      setSelectedFile(null);
      router.refresh();
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload profile picture");
    },
  });

  const removeMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/users/${userId}/profile-picture`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove profile picture");
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast.success(data.message || "Profile picture removed successfully");
      onImageUpdate?.(data.imageUrl);
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to remove profile picture");
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleRemove = () => {
    removeMutation.mutate();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const isDefaultImage = currentImageUrl === "/media/avatar.avif";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Camera className="h-5 w-5" />
          Profile Picture
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center gap-4">
          <Avatar className="h-80 w-80 mb-5">
            <AvatarImage src={currentImageUrl} alt={userName} />
            <AvatarFallback className="text-lg">
              {getInitials(userName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Change Picture
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update Profile Picture</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="flex justify-center">
                    <Avatar className="h-24 w-24">
                      <AvatarImage
                        src={previewUrl || currentImageUrl}
                        alt={userName}
                      />
                      <AvatarFallback className="text-xl">
                        {getInitials(userName)}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="space-y-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Choose Image
                    </Button>
                    {selectedFile && (
                      <p className="text-sm text-muted-foreground text-center">
                        Selected: {selectedFile.name}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpload}
                      disabled={!selectedFile || uploadMutation.isPending}
                      className="flex-1"
                    >
                      {uploadMutation.isPending ? "Uploading..." : "Upload"}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setPreviewUrl(null);
                        setSelectedFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>

            {!isDefaultImage && (
              <Button
                variant="destructive"
                size="sm"
                onClick={handleRemove}
                disabled={removeMutation.isPending}
              >
                {removeMutation.isPending ? "Removing..." : "Remove Picture"}
              </Button>
            )}
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          <p>• Supported formats: JPG, PNG, GIF</p>
          <p>• Maximum file size: 5MB</p>
          <p>• Recommended size: 400x400 pixels</p>
        </div>
      </CardContent>
    </Card>
  );
}

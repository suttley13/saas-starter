"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SignOutButton } from "@/components/auth/sign-out-button";

const profileSchema = z.object({
  displayName: z.string().min(2, { message: "Display name is required" }),
  bio: z.string().optional(),
  profileImageUrl: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface ProfileFormProps {
  user: {
    id: string;
    email: string;
    displayName?: string | null;
    bio?: string | null;
    profileImageUrl?: string | null;
  };
}

export function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(user.profileImageUrl || null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      displayName: user.displayName || "",
      bio: user.bio || "",
      profileImageUrl: user.profileImageUrl || "",
    },
  });

  async function onSubmit(data: ProfileFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: data.displayName,
          bio: data.bio,
          profileImageUrl: imageUrl,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  // This would be replaced with a proper image upload component
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size (limit to 1MB)
      if (file.size > 1024 * 1024) {
        setError("Image must be less than 1MB");
        return;
      }
      
      try {
        // For now, just create an object URL for the image preview
        // In a production environment, you would upload this to a service like S3
        const localImageUrl = URL.createObjectURL(file);
        setImageUrl(localImageUrl);
        
        // Convert the file to a base64 string to store in the database
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Set this as the actual URL that will be submitted
            setImageUrl(reader.result);
          }
        };
        reader.readAsDataURL(file);
      } catch (error) {
        console.error("Error processing image:", error);
        setError("Failed to process image");
      }
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800">Profile</h3>
        <p className="text-sm text-slate-600">
          Update your personal information
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-5">
          <div className="flex items-center gap-4">
            <UserAvatar user={user} size="lg" className={imageUrl ? "" : "bg-blue-100"} />
            <div>
              <Label htmlFor="profileImage" className="text-slate-700">Profile Image</Label>
              <Input
                id="profileImage"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="mt-1 border-slate-200 focus:border-blue-300 focus:ring-blue-200"
              />
              <p className="mt-1 text-xs text-slate-500">
                JPG, PNG or GIF. 1MB max.
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName" className="text-slate-700">Display Name</Label>
            <Input
              id="displayName"
              disabled={isLoading}
              className="border-slate-200 focus:border-blue-300 focus:ring-blue-200"
              placeholder="Your display name"
              {...register("displayName")}
            />
            {errors.displayName && (
              <p className="text-sm text-red-500 mt-1">
                {errors.displayName.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="bio" className="text-slate-700">Bio</Label>
            <Textarea
              id="bio"
              className="border-slate-200 focus:border-blue-300 focus:ring-blue-200 min-h-[100px]"
              placeholder="Tell us about yourself"
              disabled={isLoading}
              {...register("bio")}
            />
            {errors.bio && (
              <p className="text-sm text-red-500 mt-1">{errors.bio.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-slate-700">Email</Label>
            <Input
              id="email"
              type="email"
              value={user.email}
              disabled
              className="bg-slate-50 border-slate-200 text-slate-500"
            />
            <p className="text-xs text-slate-500 mt-1">
              Your email cannot be changed
            </p>
          </div>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:justify-between gap-4">
          <Button 
            type="submit" 
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            {isLoading ? "Saving..." : "Save changes"}
          </Button>
          
          <SignOutButton 
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
          />
        </div>
      </form>
    </div>
  );
} 
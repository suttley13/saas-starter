"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateSlug } from "@/lib/utils";

const organizationSchema = z.object({
  name: z.string().min(2, { message: "Organization name is required" }),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

export function CreateOrganizationForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: "",
    },
  });

  const name = watch("name");
  const slug = name ? generateSlug(name) : "";

  async function onSubmit(data: OrganizationFormValues) {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/organizations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          slug,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Something went wrong");
      }

      const { organization } = await response.json();
      router.push(`/organizations/${organization.id}`);
      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium text-slate-800">Create Organization</h3>
        <p className="text-sm text-slate-600">
          Create a new organization to collaborate with your team
        </p>
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-slate-700">Organization Name</Label>
          <Input
            id="name"
            disabled={isLoading}
            className="border-slate-200 focus:border-blue-300 focus:ring-blue-200"
            placeholder="Acme Inc."
            {...register("name")}
          />
          {errors.name && (
            <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="slug" className="text-slate-700">URL Slug</Label>
          <div className="flex items-center rounded-md border border-slate-200 bg-slate-50 px-3">
            <span className="text-sm text-slate-500">yourapp.com/</span>
            <Input
              id="slug"
              value={slug}
              disabled
              className="border-0 bg-transparent focus:ring-0"
            />
          </div>
          <p className="text-xs text-slate-500 mt-1">
            This is the URL your team will use to access your organization
          </p>
        </div>
        {error && (
          <div className="rounded-md bg-red-50 p-3 border border-red-200">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        <Button 
          type="submit" 
          className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white transition-colors" 
          disabled={isLoading}
        >
          {isLoading ? "Creating..." : "Create Organization"}
        </Button>
      </form>
    </div>
  );
} 
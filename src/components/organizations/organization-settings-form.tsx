"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  slug: string;
}

interface OrganizationSettingsFormProps {
  organization: Organization;
}

export function OrganizationSettingsForm({ organization }: OrganizationSettingsFormProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isEditing, setIsEditing] = useState({
    name: false,
    slug: false,
  });
  const [formValues, setFormValues] = useState({
    name: organization.name,
    slug: organization.slug,
  });

  const handleEdit = (field: 'name' | 'slug') => {
    setIsEditing({
      ...isEditing,
      [field]: true,
    });
  };

  const handleCancel = (field: 'name' | 'slug') => {
    setIsEditing({
      ...isEditing,
      [field]: false,
    });
    // Reset to original value
    setFormValues({
      ...formValues,
      [field]: organization[field],
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
  };

  const handleSave = async (field: 'name' | 'slug') => {
    // This would be implemented to save the changes to the database
    toast.success(`Organization ${field} updated successfully!`);
    setIsEditing({
      ...isEditing,
      [field]: false,
    });
    router.refresh();
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      setIsDeleting(true);
      try {
        // Call the DELETE API endpoint
        const response = await fetch(`/api/organizations/${organization.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to delete organization");
        }

        toast.success("Organization deleted successfully");
        
        // Navigate to dashboard after successful deletion
        router.push("/dashboard");
        // Force a refresh to update the UI
        router.refresh();
      } catch (error) {
        console.error("Error deleting organization:", error);
        toast.error(error instanceof Error ? error.message : "Failed to delete organization");
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800 mb-4">General Settings</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Organization Name
            </label>
            <div className="flex">
              <input
                type="text"
                name="name"
                value={formValues.name}
                onChange={handleChange}
                disabled={!isEditing.name}
                className={`flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${!isEditing.name ? 'bg-slate-50 opacity-75' : 'bg-white'}`}
              />
              {isEditing.name ? (
                <div className="flex ml-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                    onClick={() => handleSave('name')}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-slate-700"
                    onClick={() => handleCancel('name')}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="ml-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                  onClick={() => handleEdit('name')}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Organization Slug
            </label>
            <div className="flex">
              <input
                type="text"
                name="slug"
                value={formValues.slug}
                onChange={handleChange}
                disabled={!isEditing.slug}
                className={`flex h-10 w-full rounded-md border border-slate-200 px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 disabled:cursor-not-allowed ${!isEditing.slug ? 'bg-slate-50 opacity-75' : 'bg-white'}`}
              />
              {isEditing.slug ? (
                <div className="flex ml-2 gap-2">
                  <Button 
                    variant="outline" 
                    className="border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                    onClick={() => handleSave('slug')}
                  >
                    Save
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="text-slate-700"
                    onClick={() => handleCancel('slug')}
                  >
                    Cancel
                  </Button>
                </div>
              ) : (
                <Button 
                  variant="outline" 
                  className="ml-2 border-blue-200 text-blue-700 hover:bg-blue-50 hover:text-blue-800 hover:border-blue-300"
                  onClick={() => handleEdit('slug')}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-red-800 mb-4">Danger Zone</h2>
        <p className="text-red-600 mb-4">
          Actions here can't be undone. Be careful.
        </p>
        
        <Button 
          variant="destructive" 
          className="bg-red-600 hover:bg-red-700"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting..." : "Delete Organization"}
        </Button>
      </div>
    </div>
  );
} 
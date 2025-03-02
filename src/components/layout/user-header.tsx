"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserAvatar } from "@/components/ui/user-avatar";
import { SignOutButton } from "@/components/auth/sign-out-button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserHeaderProps {
  user: {
    id: string;
    email: string;
    displayName?: string | null;
    profileImageUrl?: string | null;
  };
  role?: "ADMIN" | "MEMBER" | null;
  organizationId?: string;
}

export function UserHeader({ user, role = null, organizationId }: UserHeaderProps) {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path;
  };

  // Only show dashboard for admin users
  const navItems = [
    ...(role === "ADMIN" ? [{ name: "Dashboard", path: "/dashboard" }] : []),
    { name: "Profile", path: "/settings/profile" },
  ];

  // If we have an organization ID and the user is on the organization page, add it
  if (organizationId && role === "MEMBER") {
    navItems.push({ name: "Organization", path: `/organizations/${organizationId}` });
  }

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link 
            href={role === "ADMIN" ? "/dashboard" : (organizationId ? `/organizations/${organizationId}` : "/dashboard")} 
            className="text-xl font-bold text-slate-800"
          >
            SaaS Kit
          </Link>
          <nav className="hidden md:flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  isActive(item.path)
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none" asChild>
              <button className="flex items-center gap-2 hover:bg-slate-50 rounded-full px-2 py-1">
                <UserAvatar user={user} size="sm" />
                <span className="text-sm font-medium text-slate-700 hidden sm:inline">
                  {user.displayName || user.email}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{user.displayName || "User"}</span>
                  <span className="text-xs text-slate-500">{user.email}</span>
                  {role && (
                    <span className="text-xs mt-1 font-medium text-blue-600">{role} User</span>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {role === "ADMIN" && (
                <Link href="/dashboard">
                  <DropdownMenuItem className="cursor-pointer">
                    Dashboard
                  </DropdownMenuItem>
                </Link>
              )}
              {organizationId && (
                <Link href={`/organizations/${organizationId}`}>
                  <DropdownMenuItem className="cursor-pointer">
                    Organization
                  </DropdownMenuItem>
                </Link>
              )}
              <Link href="/settings/profile">
                <DropdownMenuItem className="cursor-pointer">
                  Profile
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <SignOutButton variant="ghost" size="sm" className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50">
                  Sign out
                </SignOutButton>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
} 
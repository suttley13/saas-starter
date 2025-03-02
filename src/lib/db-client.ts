'use client';

/**
 * This file provides client-safe database access methods
 * Instead of using Prisma directly in client components,
 * use these methods that call API endpoints
 */

// Example client-side data fetching function
export async function fetchUserProfile() {
  const response = await fetch('/api/user/profile');
  if (!response.ok) {
    throw new Error('Failed to fetch user profile');
  }
  return response.json();
}

// Add more client-side data access methods as needed
export async function fetchSession() {
  const response = await fetch('/api/auth/session');
  if (!response.ok) {
    throw new Error('Failed to fetch session');
  }
  return response.json();
} 
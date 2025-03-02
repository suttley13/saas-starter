// This package helps ensure certain imports only work on the server
import 'server-only';

// This file can be imported by server components/modules
// to explicitly mark them as server-only. This will cause
// a build error if they're imported from client components.

// Export a dummy function for clearer imports
export function serverOnly() {
  // This function doesn't need to do anything
  // Its existence is just to mark imports
}

// Example usage in server-only files:
// import { serverOnly } from '@/lib/server-only'
// serverOnly(); 
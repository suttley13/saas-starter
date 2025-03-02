import { PrismaClient, Prisma } from '@prisma/client'

// WARNING: This file should only be imported by server components or API routes
// Client components should use the functions in db-client.ts instead

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Define the PrismaClient options
const prismaClientOptions: Prisma.PrismaClientOptions = {
  errorFormat: 'pretty',
}

// Add logging in development
if (process.env.NODE_ENV === 'development') {
  prismaClientOptions.log = ['query', 'error', 'warn']
}

export const db = globalThis.prisma || new PrismaClient(prismaClientOptions)

// Use globalThis to persist the prisma instance across hot reloads in development
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = db
}

// Add error handling for common database connection issues
db.$connect()
  .then(() => {
    console.log('Database connection established successfully')
  })
  .catch((error) => {
    console.error('Failed to connect to the database:', error)
    // Implement proper error handling but don't crash the app
    // Just log the error and let the app continue - individual queries will fail gracefully
  }) 
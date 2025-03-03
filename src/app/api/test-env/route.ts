import { NextResponse } from 'next/server';

/**
 * API endpoint to check if environment variables are loading correctly
 * This is just for debugging - would be removed in production
 */
export async function GET() {
  const envVars = {
    hasResendApiKey: !!process.env.RESEND_API_KEY,
    emailFrom: process.env.NEXT_PUBLIC_EMAIL_FROM || 'not set',
    nodeEnv: process.env.NODE_ENV,
    // Add a preview of the API key (first few chars only)
    resendApiKeyPreview: process.env.RESEND_API_KEY 
      ? `${process.env.RESEND_API_KEY.substring(0, 5)}...` 
      : 'not set',
  };

  return NextResponse.json({ 
    message: 'Environment test', 
    environment: envVars 
  });
} 
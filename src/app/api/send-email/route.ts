import { NextResponse } from 'next/server';

/**
 * API endpoint for information about email sending
 * This endpoint is deprecated as we're now using EmailJS, which works client-side
 * POST /api/send-email
 */
export async function POST(req: Request) {
  return NextResponse.json({ 
    success: false, 
    message: 'This endpoint is deprecated. The application now uses EmailJS which operates client-side.',
    emailSystem: 'EmailJS',
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_g8lidnk',
  }, { status: 200 });
}

/**
 * GET endpoint for email configuration information
 */
export async function GET() {
  const emailJsConfig = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_g8lidnk',
    hasTemplateId: !!process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID,
    hasPublicKey: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
  };

  return NextResponse.json({
    message: 'Email system configuration',
    emailSystem: 'EmailJS',
    config: emailJsConfig,
  });
} 
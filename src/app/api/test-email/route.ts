import { NextResponse } from 'next/server';

/**
 * API endpoint to show EmailJS configuration
 * This is now just an informational endpoint as EmailJS works client-side
 */
export async function GET(req: Request) {
  // Get the URL parameters
  const url = new URL(req.url);
  const testEmail = url.searchParams.get('email') || 'test@example.com';
  
  // Log the EmailJS configuration
  console.log('====== EMAILJS CONFIGURATION ======');
  console.log(`Service ID: ${process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_g8lidnk'}`);
  console.log(`Template ID exists: ${!!process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID}`);
  console.log(`Public Key exists: ${!!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY}`);
  console.log('==================================');
  
  const emailJsConfig = {
    serviceId: process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_g8lidnk',
    hasTemplateId: !!process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID,
    hasPublicKey: !!process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY,
    isConfigured: !!(
      process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID && 
      process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID && 
      process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY
    )
  };
  
  return NextResponse.json({
    message: 'EmailJS Configuration',
    note: 'EmailJS works client-side, so no server-side testing is possible here',
    testEmail,
    config: emailJsConfig,
    setupSteps: [
      "1. Set NEXT_PUBLIC_EMAILJS_SERVICE_ID in .env.local (already done)",
      "2. Create an email template in EmailJS dashboard and get the template ID",
      "3. Set NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID with your template ID",
      "4. Get your EmailJS public key from the dashboard",
      "5. Set NEXT_PUBLIC_EMAILJS_PUBLIC_KEY with your public key"
    ]
  });
} 
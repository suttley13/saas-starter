import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/authOptions';

/**
 * API endpoint for sending emails
 * POST /api/send-email
 */
export async function POST(req: Request) {
  try {
    // Debug environment variables
    console.log('======= DEBUGGING EMAIL CONFIGURATION IN API ROUTE =======');
    console.log(`RESEND_API_KEY exists: ${!!process.env.RESEND_API_KEY}`);
    if (process.env.NEXT_PUBLIC_DEBUG_EMAIL === 'true') {
      // Only log a few characters of the key for security
      const keyPreview = process.env.RESEND_API_KEY ? 
        `${process.env.RESEND_API_KEY.substring(0, 8)}...` : 'undefined';
      console.log(`RESEND_API_KEY preview: ${keyPreview}`);
    }
    console.log(`FROM_EMAIL: ${process.env.NEXT_PUBLIC_EMAIL_FROM || 'not set'}`);
    console.log('==========================================================');

    // Check if user is authenticated
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. You must be logged in to send emails.' },
        { status: 401 }
      );
    }

    // Get email data from request body
    const { to, subject, html } = await req.json();

    // Validate required fields
    if (!to || !subject || !html) {
      return NextResponse.json(
        { error: 'Missing required fields: to, subject, and html are required' },
        { status: 400 }
      );
    }

    // Check if Resend API key is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.error('RESEND_API_KEY is not configured in the API route');
      return NextResponse.json(
        { error: 'Email service is not properly configured', emailConfigured: false },
        { status: 500 }
      );
    }

    // Initialize Resend
    const resend = new Resend(resendApiKey);
    
    // Set the from email address
    const fromEmail = process.env.NEXT_PUBLIC_EMAIL_FROM || 'onboarding@resend.dev';

    console.log(`Attempting to send email via Resend to: ${to}`);
    
    // Send email
    const data = await resend.emails.send({
      from: fromEmail,
      to,
      subject,
      html,
    });

    console.log('Email sent successfully:', data);

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully',
      emailConfigured: true,
      data
    });
  } catch (error) {
    console.error('Error sending email:', error);
    
    // Detailed error message
    let errorMessage = 'An unknown error occurred while sending the email';
    if (error instanceof Error) {
      errorMessage = error.message;
      console.error('Error details:', error.stack);
    }

    return NextResponse.json(
      { error: errorMessage, emailConfigured: true },
      { status: 500 }
    );
  }
} 
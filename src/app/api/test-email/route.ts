import { NextResponse } from 'next/server';
import { Resend } from 'resend';

/**
 * API endpoint to directly test email sending with Resend
 * This is for debugging only
 */
export async function GET(req: Request) {
  try {
    // Get the API key
    const resendApiKey = process.env.RESEND_API_KEY;
    
    // Log the environment info
    console.log('====== TEST EMAIL ENDPOINT ======');
    console.log(`API Key exists: ${!!resendApiKey}`);
    if (resendApiKey) {
      console.log(`API Key starts with: ${resendApiKey.substring(0, 6)}...`);
    }
    console.log('================================');
    
    if (!resendApiKey) {
      return NextResponse.json({ 
        success: false, 
        error: 'Resend API key is not configured' 
      }, { status: 500 });
    }
    
    // Initialize Resend with the API key
    const resend = new Resend(resendApiKey);
    
    // Set default from email
    const fromEmail = process.env.NEXT_PUBLIC_EMAIL_FROM || 'onboarding@resend.dev';
    
    // Extract the test email from the URL search parameters
    const url = new URL(req.url);
    const testEmail = url.searchParams.get('email') || 'test@example.com';
    
    // Send a test email
    try {
      const data = await resend.emails.send({
        from: fromEmail,
        to: testEmail,
        subject: 'Test Email from SaaS Starter',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #2563eb; margin-bottom: 24px;">Test Email</h1>
            <p style="margin-bottom: 16px; color: #1e293b; font-size: 16px;">
              This is a test email from your SaaS Starter application.
            </p>
            <p style="margin-bottom: 32px; color: #1e293b; font-size: 16px;">
              If you're seeing this, email sending is working correctly!
            </p>
            <p style="color: #334155; font-size: 14px;">
              Sent at: ${new Date().toISOString()}
            </p>
          </div>
        `,
      });
      
      console.log('Test email sent successfully:', data);
      
      return NextResponse.json({ 
        success: true, 
        message: `Test email sent to ${testEmail}`,
        data 
      });
    } catch (emailError) {
      console.error('Error sending test email:', emailError);
      
      let errorMessage = 'Failed to send test email';
      if (emailError instanceof Error) {
        errorMessage = emailError.message;
      }
      
      return NextResponse.json({ 
        success: false, 
        error: errorMessage 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error in test email endpoint:', error);
    
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
} 
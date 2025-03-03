// This is a placeholder mail utility
// In a production app, you would integrate with a real email service like Sendgrid, Mailgun, etc.

// Email utility using Resend
// https://resend.com/docs/sdks/node

import { Resend } from 'resend';

type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  templateParams?: Record<string, string>;
};

/**
 * Enhanced logging for email configurations
 */
export function logEmailConfig() {
  const resendApiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.NEXT_PUBLIC_EMAIL_FROM || 'onboarding@resend.dev';
  
  console.log('======= EMAIL CONFIGURATION IN MAIL.TS =======');
  console.log(`RESEND_API_KEY exists: ${!!resendApiKey}`);
  
  // Show more details if debug is enabled
  if (process.env.NEXT_PUBLIC_DEBUG_EMAIL === 'true' && resendApiKey) {
    // Only show first few characters for security
    console.log(`RESEND_API_KEY preview: ${resendApiKey.substring(0, 8)}...`);
  }
  
  console.log(`FROM_EMAIL: ${fromEmail}`);
  console.log(`Running on: ${typeof window !== 'undefined' ? 'Client-side' : 'Server-side'}`);
  console.log('==============================================');
  
  return {
    isConfigured: !!resendApiKey,
    fromEmail
  };
}

/**
 * Send an email using Resend
 */
export async function sendMail({ to, subject, html }: SendMailOptions): Promise<boolean> {
  try {
    // Log email configuration
    const config = logEmailConfig();
    
    if (!config.isConfigured) {
      console.error('Email configuration is incomplete. Cannot send email.');
      return false;
    }
    
    // Client-side implementation (redirect to server API)
    if (typeof window !== 'undefined') {
      console.log('📧 Client-side: Sending email via API to:', to);
      
      try {
        // Call your server API to send email
        const response = await fetch('/api/send-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            to,
            subject,
            html,
          }),
        });
        
        // Parse the JSON response (with error handling)
        let result;
        try {
          result = await response.json();
        } catch (jsonError) {
          console.error('Error parsing API response:', jsonError);
          result = { error: 'Invalid API response' };
        }
        
        // Check for API errors
        if (!response.ok) {
          const errorMessage = result?.error || `Failed to send email: ${response.status}`;
          console.error('API error:', errorMessage);
          throw new Error(errorMessage);
        }
        
        console.log('✅ Email API call successful:', result);
        return true;
      } catch (apiError) {
        console.error('❌ Error calling email API:', apiError);
        if (apiError instanceof Error) {
          console.error('Error details:', apiError.message);
        }
        return false;
      }
    }
    
    // Server-side implementation using Resend
    if (typeof process !== 'undefined') {
      const resendApiKey = process.env.RESEND_API_KEY;
      
      if (!resendApiKey) {
        console.error('❌ Server-side: RESEND_API_KEY is not configured');
        return false;
      }
      
      const resend = new Resend(resendApiKey);
      
      console.log('📧 Server-side: Sending email via Resend to:', to);
      
      const data = await resend.emails.send({
        from: config.fromEmail,
        to,
        subject,
        html,
      });
      
      console.log('✅ Email sent successfully:', data);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error sending email:', error);
    
    // More detailed error information
    if (error instanceof Error) {
      console.error('Error details:', error.message);
      console.error('Stack trace:', error.stack);
    }
    
    return false;
  }
}

/**
 * Send an invitation email
 */
export async function sendInvitationEmail({
  email,
  organizationName,
  inviteLink,
}: {
  email: string;
  organizationName: string;
  inviteLink: string;
}): Promise<boolean> {
  const subject = `You're invited to join ${organizationName}`;
  
  // Generate HTML for email
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #2563eb; margin-bottom: 24px;">You're invited!</h1>
      <p style="margin-bottom: 16px; color: #1e293b; font-size: 16px;">
        You've been invited to join <strong>${organizationName}</strong> on our SaaS platform.
      </p>
      <p style="margin-bottom: 32px; color: #1e293b; font-size: 16px;">
        Click the link below to accept the invitation and get started:
      </p>
      <a 
        href="${inviteLink}" 
        style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin-bottom: 32px; font-weight: bold;"
      >
        Accept Invitation
      </a>
      <p style="color: #334155; font-size: 14px;">
        If you didn't expect this invitation, you can safely ignore this email.
      </p>
    </div>
  `;
  
  return sendMail({ 
    to: email, 
    subject, 
    html
  });
} 
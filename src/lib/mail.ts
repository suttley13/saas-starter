// This is a placeholder mail utility
// In a production app, you would integrate with a real email service like Sendgrid, Mailgun, etc.

// Email utility using EmailJS
// https://www.emailjs.com/docs/sdk/installation/

import emailjs from '@emailjs/browser';

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
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_g8lidnk'; // Use the provided service ID
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID;
  
  console.log('======= EMAILJS CONFIGURATION =======');
  console.log(`PUBLIC_KEY: ${publicKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`SERVICE_ID: ${serviceId ? '✅ Configured' : '❌ Missing'}`);
  console.log(`TEMPLATE_ID: ${templateId ? '✅ Configured' : '❌ Missing'}`);
  console.log(`Running on: ${typeof window !== 'undefined' ? 'Client-side' : 'Server-side'}`);
  console.log('=====================================');
  
  return {
    isConfigured: !!(serviceId), // Only require serviceId for now
    hasFullConfig: !!(publicKey && serviceId && templateId),
    publicKey,
    serviceId,
    templateId
  };
}

/**
 * Send an email using EmailJS
 */
export async function sendMail({ to, subject, html, templateParams }: SendMailOptions): Promise<boolean> {
  try {
    // Log email configuration
    const config = logEmailConfig();
    
    // Server-side implementation (log only)
    if (typeof window === 'undefined') {
      console.log('====================================');
      console.log(`📧 SERVER-SIDE EMAIL: Would send to ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`CONTENT: ${html}`);
      if (templateParams) {
        console.log(`TEMPLATE PARAMS: ${JSON.stringify(templateParams, null, 2)}`);
      }
      console.log('====================================');
      return true; // Server-side always "succeeds" since we just log
    }
    
    // Check for minimal configuration
    if (!config.serviceId) {
      console.error('Email service ID is missing. Cannot send email.');
      return false;
    }
    
    // If we're missing template ID or public key, log a warning but allow
    // the invitation creation to proceed
    if (!config.hasFullConfig) {
      console.warn('⚠️ EmailJS is not fully configured. Emails will not be sent.');
      console.warn('Missing configuration:', 
        !config.publicKey ? 'Public Key, ' : '',
        !config.templateId ? 'Template ID, ' : '');
      console.warn('Invitation will be created but email will not be sent.');
      
      // Return false to indicate email wasn't sent, but allow invitation creation
      return false;
    }
    
    // Client-side EmailJS implementation
    const params = {
      to_email: to,
      subject,
      ...templateParams
    };
    
    console.log('📧 Sending email via EmailJS to:', to);
    console.log('With params:', JSON.stringify(params, null, 2));
    
    // Send email using EmailJS
    try {
      // Make sure EmailJS is initialized
      if (typeof emailjs.init === 'function' && config.publicKey) {
        try {
          emailjs.init(config.publicKey);
        } catch (initError) {
          console.warn('EmailJS may already be initialized:', initError);
        }
      }
      
      const response = await emailjs.send(
        config.serviceId || '',
        config.templateId || '',
        params
      );
      
      console.log('✅ Email sent successfully:', response);
      return true;
    } catch (emailjsError) {
      console.error('❌ Error sending email with EmailJS:', emailjsError);
      if (emailjsError instanceof Error) {
        console.error('Error details:', emailjsError.message);
      }
      return false;
    }
  } catch (error) {
    console.error('❌ Error in sendMail function:', error);
    
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
  
  // Generate HTML for fallback server-side logging
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
  
  // Template params for EmailJS
  const templateParams = {
    organization_name: organizationName,
    invite_link: inviteLink
  };
  
  return sendMail({ 
    to: email, 
    subject, 
    html, 
    templateParams 
  });
} 
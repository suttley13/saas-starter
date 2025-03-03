// This is a placeholder mail utility
// In a production app, you would integrate with a real email service like Sendgrid, Mailgun, etc.

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
  const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
  const templateId = process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID;
  
  console.log('======= EMAIL CONFIGURATION =======');
  console.log(`PUBLIC_KEY: ${publicKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`SERVICE_ID: ${serviceId ? '✅ Configured' : '❌ Missing'}`);
  console.log(`TEMPLATE_ID: ${templateId ? '✅ Configured' : '❌ Missing'}`);
  console.log('==================================');
  
  return {
    isConfigured: !!(publicKey && serviceId && templateId),
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
    
    if (!config.isConfigured) {
      console.error('Email configuration is incomplete. Cannot send email.');
      return false;
    }
    
    if (typeof window === 'undefined') {
      // Server-side implementation (logs only)
      console.log('====================================');
      console.log(`📧 SERVER-SIDE EMAIL: Would send to ${to}`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`CONTENT: ${html}`);
      if (templateParams) {
        console.log(`TEMPLATE PARAMS: ${JSON.stringify(templateParams, null, 2)}`);
      }
      console.log('====================================');
      return true;
    }

    // Client-side EmailJS implementation
    const params = {
      to_email: to,
      subject: subject,
      ...templateParams
    };

    console.log('📧 Sending email via EmailJS to:', to);
    console.log('With params:', JSON.stringify(params, null, 2));
    
    // Ensure EmailJS is initialized before sending
    // NOTE: We don't need to re-initialize EmailJS here as it's already initialized in EmailJSProvider
    // If not initialized, log a warning
    if (!config.publicKey) {
      console.warn('EmailJS public key is missing. Cannot send email properly.');
    }
    
    const response = await emailjs.send(
      config.serviceId || '',
      config.templateId || '',
      params
    );

    console.log('✅ Email sent successfully:', response);
    return true;
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
  
  // Generate HTML for fallback server-side logging
  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #3b82f6; margin-bottom: 24px;">You're invited!</h1>
      <p style="margin-bottom: 16px;">
        You've been invited to join <strong>${organizationName}</strong> on our SaaS platform.
      </p>
      <p style="margin-bottom: 32px;">
        Click the link below to accept the invitation and get started:
      </p>
      <a 
        href="${inviteLink}" 
        style="background-color: #3b82f6; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin-bottom: 32px;"
      >
        Accept Invitation
      </a>
      <p style="color: #64748b; font-size: 14px;">
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
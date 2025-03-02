// This is a placeholder mail utility
// In a production app, you would integrate with a real email service like Sendgrid, Mailgun, etc.

import emailjs from '@emailjs/browser';

type SendMailOptions = {
  to: string;
  subject: string;
  html: string;
  templateParams?: Record<string, string>;
};

// Initialize EmailJS with your public key
// You should set these in your .env.local file
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || 'YOUR_PUBLIC_KEY';
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || 'service_butvin1';
const EMAILJS_INVITATION_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID || 'YOUR_TEMPLATE_ID';

/**
 * Send an email using EmailJS
 */
export async function sendMail({ to, subject, html, templateParams }: SendMailOptions): Promise<boolean> {
  try {
    if (typeof window === 'undefined') {
      // Server-side mock implementation
      console.log('====================================');
      console.log(`SENDING EMAIL TO: ${to}`);
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

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_INVITATION_TEMPLATE_ID,
      params,
      EMAILJS_PUBLIC_KEY
    );

    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
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
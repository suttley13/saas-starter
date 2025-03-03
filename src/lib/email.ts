import emailjs from '@emailjs/browser';

/**
 * Initialize EmailJS with the public key from environment variables
 */
export function initEmailJS() {
  const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;
  
  if (!publicKey) {
    console.error('EmailJS public key is not defined in environment variables');
    return false;
  }
  
  try {
    emailjs.init(publicKey);
    return true;
  } catch (error) {
    console.error('Failed to initialize EmailJS:', error);
    return false;
  }
}

/**
 * Send an invitation email using EmailJS
 * 
 * @param email Recipient email address
 * @param token Invitation token
 * @param organizationName Name of the organization sending the invitation
 * @returns Promise<boolean> True if email was sent successfully
 */
export async function sendInvitationEmail(email: string, token: string, organizationName: string): Promise<boolean> {
  try {
    // Use window.location.origin to get the current domain and port dynamically
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const inviteLink = `${baseUrl}/invitations/${token}`;
    
    const templateParams = {
      to_email: email,
      subject: `You're invited to join ${organizationName}`,
      organization_name: organizationName,
      invite_link: inviteLink
    };
    
    const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID || "";
    const templateId = process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID || "";
    
    if (!serviceId || !templateId) {
      console.error('EmailJS service ID or template ID is not defined in environment variables');
      return false;
    }
    
    console.log('Sending email with params:', {
      serviceId,
      templateId,
      templateParams,
      publicKey: process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY ? '[PRESENT]' : '[MISSING]'
    });
    
    const response = await emailjs.send(
      serviceId,
      templateId,
      templateParams
    );
    
    console.log('Email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending email via EmailJS:', error);
    return false;
  }
} 
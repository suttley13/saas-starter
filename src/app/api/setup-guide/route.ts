import { NextResponse } from 'next/server';

/**
 * API endpoint to provide setup information for EmailJS
 */
export async function GET() {
  const sampleTemplate = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invitation to join {{organization_name}}</title>
</head>
<body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
  <table style="width: 100%; max-width: 600px; margin: 0 auto; background-color: white; border-collapse: collapse;">
    <tr>
      <td style="padding: 40px 30px;">
        <h1 style="color: #2563eb; margin-bottom: 24px;">You're invited!</h1>
        <p style="margin-bottom: 16px; color: #1e293b; font-size: 16px;">
          You've been invited to join <strong>{{organization_name}}</strong> on our SaaS platform.
        </p>
        <p style="margin-bottom: 32px; color: #1e293b; font-size: 16px;">
          Click the link below to accept the invitation and get started:
        </p>
        <a 
          href="{{invite_link}}" 
          style="background-color: #2563eb; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; margin-bottom: 32px; font-weight: bold;"
        >
          Accept Invitation
        </a>
        <p style="color: #334155; font-size: 14px;">
          If you didn't expect this invitation, you can safely ignore this email.
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
  `;

  const setupSteps = [
    {
      step: 1,
      title: "Sign in to your EmailJS account",
      description: "Go to https://dashboard.emailjs.com/admin and log in to your account"
    },
    {
      step: 2,
      title: "Add an Email Service",
      description: "If you haven't already, add an email service like Gmail or another provider"
    },
    {
      step: 3,
      title: "Create a new Email Template",
      description: "Click on 'Email Templates' in the sidebar and then 'Create New Template'"
    },
    {
      step: 4,
      title: "Set up the template",
      description: "Give it a name like 'Invitation Template', and paste the HTML above into the template editor"
    },
    {
      step: 5,
      title: "Save and get Template ID",
      description: "Save the template and copy the Template ID (it will look like 'template_abc123')"
    },
    {
      step: 6,
      title: "Get your Public Key",
      description: "Go to Account > API Keys in the sidebar and copy your Public Key"
    },
    {
      step: 7,
      title: "Update environment variables",
      description: "Add your Template ID and Public Key to .env.local and your Vercel environment variables"
    }
  ];

  const environmentVariables = {
    required: [
      {
        name: "NEXT_PUBLIC_EMAILJS_SERVICE_ID",
        value: "service_g8lidnk",
        status: "✅ Already configured"
      },
      {
        name: "NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID",
        value: "",
        status: "❌ Not configured - needed for sending emails"
      },
      {
        name: "NEXT_PUBLIC_EMAILJS_PUBLIC_KEY",
        value: "",
        status: "❌ Not configured - needed for sending emails"
      }
    ]
  };

  return NextResponse.json({
    title: "EmailJS Setup Guide",
    description: "Follow these steps to set up your EmailJS integration for sending invitation emails",
    sampleTemplate,
    setupSteps,
    environmentVariables,
  });
} 
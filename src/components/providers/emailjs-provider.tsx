"use client";

import { useEffect } from "react";
import emailjs from "@emailjs/browser";

// Initialize EmailJS with your public key
export function EmailJSProvider() {
  useEffect(() => {
    // Initialize EmailJS only on the client side
    if (typeof window !== 'undefined') {
      const publicKey = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "";
      
      if (!publicKey || publicKey === "your_emailjs_public_key") {
        console.warn(
          'EmailJS Warning: Public key not configured. Email functionality will not work. ' +
          'Please set NEXT_PUBLIC_EMAILJS_PUBLIC_KEY in your environment variables.'
        );
        return;
      }
      
      try {
        emailjs.init(publicKey);
        console.log('EmailJS initialized successfully');
        
        // Log service and template info for debugging
        const serviceId = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
        const templateId = process.env.NEXT_PUBLIC_EMAILJS_INVITATION_TEMPLATE_ID;
        
        if (!serviceId || serviceId === "your_emailjs_service_id") {
          console.warn('EmailJS Warning: Service ID not properly configured');
        }
        
        if (!templateId || templateId === "your_invitation_template_id") {
          console.warn('EmailJS Warning: Template ID not properly configured');
        }
      } catch (error) {
        console.error('Error initializing EmailJS:', error);
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
} 
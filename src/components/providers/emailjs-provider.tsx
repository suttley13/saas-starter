"use client";

import { useEffect } from "react";
import emailjs from "@emailjs/browser";
import { logEmailConfig } from "@/lib/mail";

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
        // Initialize EmailJS
        emailjs.init(publicKey);
        console.log('EmailJS initialized successfully on client');
        
        // Use the shared logging function
        const config = logEmailConfig();
        
        if (!config.isConfigured) {
          console.warn('⚠️ EmailJS is initialized but configuration is incomplete. Emails may not be sent correctly.');
        } else {
          console.log('✅ EmailJS is fully configured and ready to send emails');
        }
      } catch (error) {
        console.error('Error initializing EmailJS:', error);
        if (error instanceof Error) {
          console.error('Error details:', error.message);
        }
      }
    }
  }, []);

  // This component doesn't render anything
  return null;
} 
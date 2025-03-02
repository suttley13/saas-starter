"use client";

import { useEffect } from "react";
import emailjs from "@emailjs/browser";

// Initialize EmailJS with your public key
// You should set this in your .env.local file
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY || "YOUR_PUBLIC_KEY";

export function EmailJSProvider() {
  useEffect(() => {
    // Initialize EmailJS only on the client side
    if (typeof window !== 'undefined') {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialized');
    }
  }, []);

  // This component doesn't render anything
  return null;
} 
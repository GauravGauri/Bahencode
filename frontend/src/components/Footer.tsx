'use client';

import React from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#2a1f1a] text-white/60 py-12 px-6 md:px-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
        
        {/* Left Side: Copyright */}
        <div className="order-3 md:order-1">
          <p className="text-xs tracking-[0.06em]">
            &copy; {new Date().getFullYear()} behencode. All rights reserved.
          </p>
        </div>

        {/* Center: Heart Icon logo */}
        <div className="order-1 md:order-2 flex flex-col items-center gap-1 select-none">
          <span className="font-playfair text-xl font-bold text-white tracking-wide">
            behencode<span className="text-rose font-sans">♡</span>
          </span>
          <p className="text-[7px] tracking-[0.25em] uppercase text-white/40">
            made with love in india
          </p>
        </div>

        {/* Right Side: Links & Social */}
        <div className="order-2 md:order-3 flex flex-col items-center md:items-end gap-4">
          <div className="flex flex-wrap justify-center gap-6 text-xs uppercase tracking-[0.1em] font-medium text-white/60">
            <Link href="/shop" className="hover:text-blush transition-colors">Size Guide</Link>
            <Link href="/about" className="hover:text-blush transition-colors">Shipping</Link>
            <Link href="/contact" className="hover:text-blush transition-colors">Returns</Link>
            <Link href="/contact" className="hover:text-blush transition-colors">FAQs</Link>
            <Link href="/contact" className="hover:text-blush transition-colors">Contact Us</Link>
          </div>
          
          <div className="flex items-center gap-2 text-rose hover:text-blush transition-colors text-xs font-semibold">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-instagram"
            >
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
            </svg>
            <a href="https://instagram.com/behencode.in" target="_blank" rel="noopener noreferrer" className="tracking-wide">
              @behencode.in
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}

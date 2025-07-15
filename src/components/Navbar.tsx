'use client'

import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig'; // Adjust the import path
import Image from 'next/image';
import { useState, useEffect } from 'react';

// Declare global interface for Google Translate directly on the Window object
declare global {
  interface Window {
    google: {
      translate: {
        TranslateElement: {
          new (
            options: {
              pageLanguage: string;
              includedLanguages: string;
              layout: number;
            },
            elementId: string
          ): void;
          InlineLayout: { SIMPLE: number }; // Correctly placed InlineLayout here
        };
      };
    };
    googleTranslateElementInit: () => void;
  }
}

const Navbar = () => {
  const [user, loading] = useAuthState(auth);
  const [isTranslateOpen, setIsTranslateOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    if (isTranslateOpen) {
      // Check if the script is already appended and if Google Translate API is available
      if (!window.google || !window.google.translate || !window.google.translate.TranslateElement) {
        const script = document.createElement('script');
        script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
        script.async = true;
        document.body.appendChild(script);

        // Define the callback function globally so the Google Translate script can find it
        window.googleTranslateElementInit = () => {
          new window.google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,as,bn,hi',
            layout: window.google.translate.TranslateElement.InlineLayout.SIMPLE
          }, 'google_translate_element');
        };
      } else {
        // If Google Translate is already loaded and dropdown is opened again, re-initialize it.
        window.googleTranslateElementInit();
      }
    }
  }, [isTranslateOpen]);

  return (
    <nav className="bg-[var(--primary-blue)] p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold hover:text-blue-200">
          <Image src="/logo.png" alt="Logo" width={50} height={50} />
        </Link>

        <div className="flex space-x-4 items-center">
          <Link href="/alerts" className="hover:text-blue-200">
            Flood Alerts
          </Link>
          <Link href="/resources" className="hover:text-blue-200">
            Resources
          </Link>
          {!loading && user && (
            <Link href="/summarize" className="hover:text-blue-200">
              Summarize
            </Link>
          )}

          <div className="relative">
            <button
              onClick={() => setIsTranslateOpen(!isTranslateOpen)}
              className="hover:text-blue-200 focus:outline-none flex items-center space-x-1"
            >
              <span>Translate</span>
              <svg
                className={`w-4 h-4 transform transition-transform duration-200 ${
                  isTranslateOpen ? 'rotate-180' : 'rotate-0'
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
              </svg>
            </button>
            {isTranslateOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 text-gray-800"
                onMouseLeave={() => setIsTranslateOpen(false)}
              >
                <div id="google_translate_element" className="p-2"></div>
              </div>
            )}
          </div>

          {!loading && (
            user ? (
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            ) : (
              <>
                <Link href="/login" className="hover:text-blue-200">
                  Login
                </Link>
                <Link href="/signup" className="hover:text-blue-200">
                  Signup
                </Link>
              </>
            )
          )}
          {loading && (
            <div className="text-blue-300 text-sm">Loading User...</div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

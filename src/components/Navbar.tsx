'use client';

import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signOut } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig'; // Adjust the import path

const Navbar = () => {
  const [user, loading] = useAuthState(auth);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User logged out");
      // Optionally redirect after logout, e.g., to the home page
      // router.push('/');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-[var(--primary-blue)] p-4 text-white shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo or Site Title */}
        <Link href="/" className="text-xl font-bold hover:text-blue-200">
          Aapada Mitra
        </Link>

        {/* Navigation Links */}
        <div className="flex space-x-4 items-center">
          <Link href="/alerts" className="hover:text-blue-200">
            Flood Alerts
          </Link>
          <Link href="/resources" className="hover:text-blue-200">
            Resources
          </Link>
          {/* Only show Summarize if user is logged in (assuming it's an admin/leader tool) */}
          {!loading && user && (
            <Link href="/summarize" className="hover:text-blue-200">
              Summarize
            </Link>
          )}


          {/* Authentication Links/Button */}
          {!loading && (
            user ? (
              // User is logged in
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
              >
                Logout
              </button>
            ) : (
              // User is not logged in
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
          {/* Optional: Show something while loading auth state */}
           {loading && (
               <div className="text-blue-300 text-sm">Loading User...</div>
           )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
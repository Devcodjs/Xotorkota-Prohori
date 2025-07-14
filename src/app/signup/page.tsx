'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthState } from 'react-firebase-hooks/auth';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebaseConfig'; // Adjust import path
import toast from 'react-hot-toast';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !loading) {
      router.push('/alerts'); // Redirect to a dashboard or alerts page after signup
    }
  }, [user, loading, router]);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      // Successfully signed up - useEffect will handle the redirect
    } catch (error: any) {
      console.error('Signup error:', error);
      // Display user-friendly error messages based on Firebase error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('The email address is already in use by another account.');
          break;
        case 'auth/invalid-email':
          setError('The email address is not valid.');
          break;
        case 'auth/weak-password':
          setError('The password is too weak (should be at least 6 characters).');
          break;
        default:
          setError('An error occurred during signup. Please try again.');
          break;
      }
    }finally{
      toast.success('Signup successful!');
    }
  };

  // Show loading indicator while auth state is determined
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

   // If user is already logged in, don't render the form (useEffect handles redirect)
   if (user) {
       return null;
   }


  return (
    <div className="flex justify-center items-center min-h-[calc(100vh-64px)] bg-gray-100"> {/* Adjust min-height based on Navbar height */}
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-center text-gray-900">Create Your Account</h2>
        <form className="mt-8 space-y-6" onSubmit={handleSignup}>
          <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="sr-only">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              className="relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

           {error && (
            <div className="text-red-500 text-sm text-center">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign up
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;

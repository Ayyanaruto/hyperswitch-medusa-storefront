"use client"
import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { cookies } from 'next/headers';

export default function PaymentErrorPage(): React.ReactElement {
  const params = useParams();
  const { countryCode } = params;

  React.useEffect(() => {
    // Remove the medusa cart cookie
    document.cookie = '_medusa_cart_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
        <svg
          className="mx-auto mb-4 h-12 w-12 text-red-500"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h1 className="text-2xl font-semibold mb-2">Payment Error</h1>
        <p className="text-gray-600 mb-6">
          Something went wrong with your payment. Please try again or contact support if the issue persists.
        </p>
        <div className="flex justify-center space-x-4"></div>
          <Link href={`/${countryCode}/cart`} className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">Retry Payment</Link>
          <Link href={`/${countryCode}/support`} className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600">Contact Support</Link>
        </div>
      </div>
   
  );
}

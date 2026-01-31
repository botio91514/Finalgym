import React from 'react';
import { Link } from 'react-router-dom';

const ThankYou: React.FC = () => {
  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-xl p-8 text-center">
      <h2 className="text-3xl font-bold mb-4 text-gray-800">Thank You!</h2>
      <p className="text-gray-600 mb-6">
        Your registration has been submitted successfully. Please check your email for confirmation.
      </p>
      <Link
        to="/"
        className="px-6 py-3 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 inline-block"
      >
        Return Home
      </Link>
    </div>
  );
};

export default ThankYou; 
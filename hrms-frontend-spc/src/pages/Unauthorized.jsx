import React from 'react';
import { Link } from 'react-router-dom';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-950 text-gray-200 px-6">
      <div className="max-w-md text-center space-y-4">
        <h1 className="text-3xl font-bold text-white">Unauthorized</h1>
        <p className="text-gray-400">
          You don't have permission to access this area.
        </p>

        <Link to="/" className="btn-primary inline-flex justify-center">
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;

import React from 'react';
import { FaCheckCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Success = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-secClr/50" >
      <div className="max-w-lg w-full bg-white rounded-xl shadow-2xl p-10 text-center transform transition-all duration-500 hover:scale-105">
        <FaCheckCircle className="mx-auto text-7xl mb-6 animate-bounce" style={{ color: '#2F5318' }} />
        <h1 className="text-3xl md:text-4xl font-extrabold mb-3" style={{ color: '#2F5318' }}>
          Success!
        </h1>
        <p className="text-sm md:text-lg mb-8">
          Your application has been submitted successfully. We'll get back to you shortly.
        </p>
        <Link
          to="/"
          className="inline-block px-8 py-4 rounded-lg font-semibold bg-secClr text-white transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Success;
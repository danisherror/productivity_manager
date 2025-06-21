import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from '../api'; // adjust based on your setup

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying your email...');
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setMessage('Invalid or missing token.');
      return;
    }

    const verify = async () => {
      try {
        const res = await axios.get(`/verify-email?token=${token}`);
        setMessage(res.data.message || 'Email verified successfully!');
        setTimeout(() => navigate('/signin'), 3000); // redirect to signin after 3 sec
      } catch (err) {
        setMessage(err.response?.data?.message || 'Email verification failed.');
      }
    };

    verify();
  }, [searchParams, navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white shadow-lg p-6 rounded-xl text-center max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Email Verification</h2>
        <p className="text-gray-700">{message}</p>
      </div>
    </div>
  );
}

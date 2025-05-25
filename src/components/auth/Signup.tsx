import React, { useState } from 'react';
import { useMemberstack } from '@memberstack/react';

interface SignupProps {
  onSuccess: () => void;
  onSwitchToLogin: () => void;
  onClose: () => void;
}

const Signup: React.FC<SignupProps> = ({ onSuccess, onSwitchToLogin, onClose }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const memberstack = useMemberstack();

  const handleSignup = async () => {
    setError('');
    setLoading(true);
    try {
      await memberstack.openModal('SIGNUP');
      onSuccess();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface rounded-xl shadow-lg p-8 border border-accent/20">
      <h2 className="text-2xl font-bold text-accent mb-6">Create Account</h2>
      <button
        onClick={handleSignup}
        disabled={loading}
        className="w-full py-2 px-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent2 transition-colors duration-200 disabled:opacity-50 mb-4"
      >
        {loading ? 'Opening Signup...' : 'Sign Up with Memberstack'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="mt-4 text-center text-sm text-textSecondary">
        Already have an account?{' '}
        <button
          onClick={onSwitchToLogin}
          className="text-accent hover:text-accent2 font-semibold"
        >
          Sign in
        </button>
      </p>
      <button
        onClick={onClose}
        className="absolute top-2 right-2 text-2xl text-accent hover:text-accent2 font-bold"
        aria-label="Close"
      >
        ×
      </button>
    </div>
  );
};

export default Signup; 
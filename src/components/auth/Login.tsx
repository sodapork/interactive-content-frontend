import React, { useState } from 'react';
import { useMemberstack } from '@memberstack/react';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
  onClose: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToSignup, onClose }) => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const memberstack = useMemberstack();

  const handleLogin = async () => {
    setError('');
    setLoading(true);
    try {
      await memberstack.openModal('LOGIN');
      onSuccess();
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface rounded-xl shadow-lg p-8 border border-accent/20">
      <h2 className="text-2xl font-bold text-accent mb-6">Welcome Back</h2>
      <button
        onClick={handleLogin}
        disabled={loading}
        className="w-full py-2 px-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent2 transition-colors duration-200 disabled:opacity-50 mb-4"
      >
        {loading ? 'Opening Login...' : 'Sign In with Memberstack'}
      </button>
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <p className="mt-4 text-center text-sm text-textSecondary">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-accent hover:text-accent2 font-semibold"
        >
          Sign up
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

export default Login; 
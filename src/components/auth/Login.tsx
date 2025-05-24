import React, { useState } from 'react';
import { signIn } from '../../services/memberstack';

interface LoginProps {
  onSuccess: () => void;
  onSwitchToSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ onSuccess, onSwitchToSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn(email, password);
      if (result.success) {
        onSuccess();
      } else {
        setError('Invalid email or password');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface rounded-xl shadow-lg p-8 border border-accent/20">
      <h2 className="text-2xl font-bold text-accent mb-6">Welcome Back</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-textSecondary mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-accent/20 bg-background text-text"
            required
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-textSecondary mb-1">
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-accent/20 bg-background text-text"
            required
          />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 px-4 bg-accent text-white rounded-lg font-semibold hover:bg-accent2 transition-colors duration-200 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-textSecondary">
        Don't have an account?{' '}
        <button
          onClick={onSwitchToSignup}
          className="text-accent hover:text-accent2 font-semibold"
        >
          Sign up
        </button>
      </p>
    </div>
  );
};

export default Login; 
import React, { useState, useEffect } from 'react';
import { getAuthState } from '../../services/memberstack';
import Login from './Login';
import Signup from './Signup';

interface AuthWrapperProps {
  children: React.ReactNode;
}

const AuthWrapper: React.FC<AuthWrapperProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { isAuthenticated } = await getAuthState();
    setIsAuthenticated(isAuthenticated);
  };

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-accent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return showSignup ? (
      <Signup
        onSuccess={handleAuthSuccess}
        onSwitchToLogin={() => setShowSignup(false)}
      />
    ) : (
      <Login
        onSuccess={handleAuthSuccess}
        onSwitchToSignup={() => setShowSignup(true)}
      />
    );
  }

  return <>{children}</>;
};

export default AuthWrapper; 
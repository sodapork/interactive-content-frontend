import React, { useState, useEffect } from 'react';

const LoadingSpinner: React.FC = () => {
  const messages = [
    'Fetching data...',
    'Generating ideas...',
    'Asking GPT-4...',
    'Building your tool...',
    'Almost there...'
  ];
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col justify-center items-center py-12">
      <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent shadow-[0_0_24px_4px_rgba(99,102,241,0.3)] mb-6"></div>
      <p className="text-text font-semibold text-xl drop-shadow-md">{messages[currentMessageIndex]}</p>
      <p className="text-sm text-textSecondary mt-3">Tool generation can take a few minutes. Please wait...</p>
    </div>
  );
};

export default LoadingSpinner; 
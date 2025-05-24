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
    <div className="flex flex-col justify-center items-center py-6">
      <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-accent shadow-[0_0_16px_4px_rgba(127,90,240,0.5)] mb-4"></div>
      <p className="text-text font-semibold text-lg drop-shadow-md">{messages[currentMessageIndex]}</p>
      <p className="text-sm text-textSecondary mt-2">Tool generation can take a few minutes. Please wait...</p>
    </div>
  );
};

export default LoadingSpinner; 
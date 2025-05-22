import React from 'react';

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center py-6">
    <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-b-4 border-blue-600"></div>
  </div>
);

export default LoadingSpinner; 
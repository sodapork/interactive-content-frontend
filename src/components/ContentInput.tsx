import React, { useState } from 'react';
import { ContentInputProps, ContentType } from '../types';

const ContentInput: React.FC<ContentInputProps> = ({ onSubmit }) => {
  const [content, setContent] = useState('');
  const [type, setType] = useState<ContentType>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(content, type);
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Input Your Content
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>Enter your blog post content or URL to generate an interactive tool.</p>
        </div>
        <form onSubmit={handleSubmit} className="mt-5">
          <div className="flex space-x-4 mb-4">
            <button
              type="button"
              onClick={() => setType('text')}
              className={`px-4 py-2 rounded-md ${
                type === 'text'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Text Input
            </button>
            <button
              type="button"
              onClick={() => setType('url')}
              className={`px-4 py-2 rounded-md ${
                type === 'url'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              URL Input
            </button>
          </div>
          {type === 'text' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Paste your blog post content here..."
            />
          ) : (
            <input
              type="url"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter the URL of your blog post..."
            />
          )}
          <div className="mt-5">
            <button
              type="submit"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Generate Tool
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContentInput; 
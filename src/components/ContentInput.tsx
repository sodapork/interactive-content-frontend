import React, { useState } from 'react';
import { ContentType } from '../types';

interface ContentInputProps {
  onSubmit: (input: string, type: ContentType) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ onSubmit }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState<ContentType>('text');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input, type);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-white rounded-xl shadow-md p-8 flex flex-col gap-6 mt-[-60px] relative z-10">
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="flex bg-gray-100 rounded-full p-1 shadow-inner">
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${type === 'text' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setType('text')}
          >
            Text Input
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${type === 'url' ? 'bg-blue-600 text-white shadow' : 'text-gray-700 hover:bg-gray-200'}`}
            onClick={() => setType('url')}
          >
            URL Input
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          className="w-full px-6 py-4 rounded-lg border border-gray-200 shadow focus:ring-2 focus:ring-blue-400 focus:border-blue-400 text-lg transition-all placeholder-gray-400 bg-gray-50"
          placeholder={type === 'url' ? 'Paste your blog post URL here...' : 'Paste or write your blog post content here...'}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 mt-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-lg font-bold shadow-lg transition-all"
      >
        Generate Tool
      </button>
    </form>
  );
};

export default ContentInput; 
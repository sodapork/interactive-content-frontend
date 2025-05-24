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
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto bg-surface rounded-xl shadow-lg p-8 flex flex-col gap-6 mt-[-60px] relative z-10 border border-accent/30">
      <div className="flex items-center justify-center gap-4 mb-2">
        <div className="flex bg-background rounded-full p-1 shadow-inner border border-accent/20">
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${type === 'text' ? 'bg-accent text-white shadow' : 'text-textSecondary hover:bg-surface'}`}
            onClick={() => setType('text')}
          >
            Text Input
          </button>
          <button
            type="button"
            className={`px-6 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${type === 'url' ? 'bg-accent text-white shadow' : 'text-textSecondary hover:bg-surface'}`}
            onClick={() => setType('url')}
          >
            URL Input
          </button>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          className="w-full px-6 py-4 rounded-lg border border-accent/20 shadow focus:ring-2 focus:ring-accent focus:border-accent text-lg transition-all placeholder-textSecondary bg-background text-text"
          placeholder={type === 'url' ? 'Paste your blog post URL here...' : 'Describe your blog post in a sentence or two...'}
          value={input}
          onChange={e => setInput(e.target.value)}
        />
      </div>
      <button
        type="submit"
        className="w-full py-3 mt-2 rounded-full bg-accent hover:bg-accent2 text-white text-lg font-bold shadow-lg transition-all"
      >
        Generate Tool
      </button>
    </form>
  );
};

export default ContentInput; 
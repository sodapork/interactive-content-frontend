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
    <form onSubmit={handleSubmit} className="bg-surface shadow-lg rounded-2xl p-8 border border-accent/20">
      <div className="mb-6">
        <label htmlFor="content" className="block text-lg font-semibold text-accent mb-2">
          Paste your blog content below
        </label>
        <textarea
          id="content"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Paste your blog content here..."
          className="w-full h-64 p-4 rounded-xl bg-background text-text border border-accent/20 focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all resize-none"
          required
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
import React, { useState } from 'react';
import { ContentType } from '../types';

interface ContentInputProps {
  onSubmit: (input: string, type: ContentType, userStyleOverride?: any) => void;
  showStyleInput?: boolean;
  onStyleSubmit?: (style: any) => void;
}

const ContentInput: React.FC<ContentInputProps> = ({ onSubmit, showStyleInput, onStyleSubmit }) => {
  const [input, setInput] = useState('');
  const [type, setType] = useState<ContentType>('text');
  const [style, setStyle] = useState<any>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onSubmit(input, type);
    }
  };

  // If showStyleInput is true, render a simple style input form
  if (showStyleInput && onStyleSubmit) {
    return (
      <form
        onSubmit={e => {
          e.preventDefault();
          onStyleSubmit(style);
        }}
        className="w-full max-w-2xl mx-auto bg-surface rounded-xl shadow-lg p-8 flex flex-col gap-6 mt-[-60px] relative z-10 border border-accent/30"
      >
        <div className="mb-4 text-textSecondary">
          <h3 className="text-xl font-bold text-accent mb-2">Provide style details</h3>
          <p>If style extraction failed, please enter your preferred font, color, and button style below:</p>
        </div>
        <input
          type="text"
          className="w-full px-6 py-3 rounded-lg border border-accent/20 shadow focus:ring-2 focus:ring-accent focus:border-accent text-lg transition-all placeholder-textSecondary bg-background text-text"
          placeholder="Font family (e.g. Inter, Arial)"
          value={style.fontFamily || ''}
          onChange={e => setStyle({ ...style, fontFamily: e.target.value })}
        />
        <input
          type="text"
          className="w-full px-6 py-3 rounded-lg border border-accent/20 shadow focus:ring-2 focus:ring-accent focus:border-accent text-lg transition-all placeholder-textSecondary bg-background text-text"
          placeholder="Primary color (e.g. #7f5af0 or blue)"
          value={style.color || ''}
          onChange={e => setStyle({ ...style, color: e.target.value })}
        />
        <input
          type="text"
          className="w-full px-6 py-3 rounded-lg border border-accent/20 shadow focus:ring-2 focus:ring-accent focus:border-accent text-lg transition-all placeholder-textSecondary bg-background text-text"
          placeholder="Button style (e.g. rounded, pill, shadow)"
          value={style.buttonStyle || ''}
          onChange={e => setStyle({ ...style, buttonStyle: e.target.value })}
        />
        <button
          type="submit"
          className="w-full py-3 mt-2 rounded-full bg-accent hover:bg-accent2 text-white text-lg font-bold shadow-lg transition-all"
        >
          Submit Style
        </button>
      </form>
    );
  }

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
          placeholder={type === 'url' ? 'Paste your blog post URL here...' : 'Paste or write your blog post content here...'}
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
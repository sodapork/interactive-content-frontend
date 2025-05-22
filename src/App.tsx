import React, { useState } from 'react';
import ContentInput from './components/ContentInput';
import ToolPreview from './components/ToolPreview';
import { ContentType } from './types';
import { generateToolIdeas, processContentForIdea, updateToolWithFeedback } from './services/contentProcessor';
import axios from 'axios';

const BACKEND_URL = 'https://interactive-content-backend.onrender.com';

function App() {
  const [content, setContent] = useState<string>('');
  const [contentType, setContentType] = useState<ContentType>('text');
  const [toolIdeas, setToolIdeas] = useState<string[]>([]);
  const [selectedIdea, setSelectedIdea] = useState<string | null>(null);
  const [generatedTool, setGeneratedTool] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);
  const [showOtherIdeas, setShowOtherIdeas] = useState<boolean>(false);

  const handleContentSubmit = async (input: string, type: ContentType) => {
    setContent(input);
    setContentType(type);
    setLoading(true);
    setError(null);
    setGeneratedTool('');
    setFeedback('');
    setToolIdeas([]);
    setSelectedIdea(null);
    setShowOtherIdeas(false);
    let blogContent = input;
    try {
      if (type === 'url') {
        // Call backend to extract content from URL
        const response = await axios.post(`${BACKEND_URL}/extract`, { url: input });
        if (response.data && response.data.content) {
          blogContent = response.data.content;
        } else {
          throw new Error('Failed to extract content from URL.');
        }
      }
      const ideas = await generateToolIdeas(blogContent);
      setToolIdeas(ideas);
      setContent(blogContent); // Store extracted content for later use
    } catch (err: any) {
      setError('Failed to generate tool ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleIdeaSelect = async (idea: string) => {
    setSelectedIdea(idea);
    setLoading(true);
    setError(null);
    setGeneratedTool('');
    setFeedback('');
    setShowOtherIdeas(false);
    try {
      const tool = await processContentForIdea(content, idea);
      setGeneratedTool(tool);
    } catch (err: any) {
      setError('Failed to generate tool. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTool = async () => {
    if (!feedback.trim()) return;
    setUpdating(true);
    setError(null);
    try {
      const updatedTool = await updateToolWithFeedback(content, generatedTool, feedback);
      setGeneratedTool(updatedTool);
      setFeedback('');
    } catch (err: any) {
      setError('Failed to update tool. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleTryDifferentIdea = () => {
    setShowOtherIdeas(true);
  };

  const otherIdeas = toolIdeas.filter(idea => idea !== selectedIdea);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Interactive Content Generator
          </h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 gap-6">
            <ContentInput onSubmit={handleContentSubmit} />
            {loading && <div className="text-blue-600">{selectedIdea ? 'Generating tool...' : 'Generating ideas...'}</div>}
            {error && <div className="text-red-600">{error}</div>}
            {!loading && toolIdeas.length > 0 && !generatedTool && (
              <div className="bg-white shadow sm:rounded-lg p-6 mt-4">
                <h4 className="text-md font-semibold mb-2">Choose an Interactive Tool Idea</h4>
                <ul className="space-y-2">
                  {toolIdeas.map((idea, idx) => (
                    <li key={idx}>
                      <button
                        className="w-full text-left px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 focus:bg-blue-100 focus:outline-none"
                        onClick={() => handleIdeaSelect(idea)}
                        disabled={loading}
                      >
                        {idea}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {generatedTool && <>
              <ToolPreview tool={generatedTool} />
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <button
                  className="inline-flex items-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleTryDifferentIdea}
                  disabled={loading || otherIdeas.length === 0}
                >
                  Try a different idea
                </button>
              </div>
              {showOtherIdeas && otherIdeas.length > 0 && (
                <div className="bg-white shadow sm:rounded-lg p-6 mt-4">
                  <h4 className="text-md font-semibold mb-2">Choose Another Idea</h4>
                  <ul className="space-y-2">
                    {otherIdeas.map((idea, idx) => (
                      <li key={idx}>
                        <button
                          className="w-full text-left px-4 py-2 rounded-md border border-blue-200 hover:bg-blue-50 focus:bg-blue-100 focus:outline-none"
                          onClick={() => handleIdeaSelect(idea)}
                          disabled={loading}
                        >
                          {idea}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="bg-white shadow sm:rounded-lg p-6 mt-4">
                <h4 className="text-md font-semibold mb-2">Request a Change or Edit</h4>
                <textarea
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mb-2"
                  rows={3}
                  placeholder="Describe what you want to change or add (e.g., 'Add a pie chart', 'Change color to green')"
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  disabled={updating}
                />
                <button
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  onClick={handleUpdateTool}
                  disabled={updating || !feedback.trim()}
                >
                  {updating ? 'Updating...' : 'Update Tool'}
                </button>
              </div>
            </>}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App; 
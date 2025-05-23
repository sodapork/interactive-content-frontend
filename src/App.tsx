import React, { useState, useEffect } from 'react';
import ContentInput from './components/ContentInput';
import ToolPreview from './components/ToolPreview';
import LoadingSpinner from './components/LoadingSpinner';
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
  const [styleSummary, setStyleSummary] = useState<string>('');
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [publishing, setPublishing] = useState<boolean>(false);
  const [toolIsLive, setToolIsLive] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [publishTime, setPublishTime] = useState<number | null>(null);
  const [tab, setTab] = useState<'generate' | 'recent'>('generate');
  const [recentTools, setRecentTools] = useState<{ name: string; url: string }[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);

  useEffect(() => {
    if (tab === 'recent') {
      setLoadingRecent(true);
      fetch(`${BACKEND_URL}/recent`)
        .then(res => res.json())
        .then(data => setRecentTools(data.tools || []))
        .finally(() => setLoadingRecent(false));
    }
  }, [tab]);

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
    setStyleSummary('');
    let blogContent = input;
    let styleSummaryValue = '';
    try {
      if (type === 'url') {
        // Call backend to extract content from URL
        const response = await axios.post(`${BACKEND_URL}/extract`, { url: input });
        if (response.data && response.data.content && response.data.content.trim()) {
          blogContent = response.data.content;
          styleSummaryValue = response.data.styleSummary || '';
          setStyleSummary(styleSummaryValue);
        } else {
          setLoading(false);
          setError('Failed to extract content from URL. Please try a different link or paste the content manually.');
          return;
        }
      }
      if (!blogContent || !blogContent.trim()) {
        setLoading(false);
        setError('No content to generate ideas from.');
        return;
      }
      // Log the content being sent to /ideas
      console.log('Sending to /ideas:', blogContent.slice(0, 300));
      const ideas = await generateToolIdeas(blogContent, styleSummaryValue || styleSummary);
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
      const tool = await processContentForIdea(content, idea, styleSummary);
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

  const handlePublish = async () => {
    if (!generatedTool) return;
    setPublishing(true);
    setPublishedUrl('');
    setToolIsLive(false);
    setPublishTime(Date.now());
    try {
      const filename = (selectedIdea ? selectedIdea.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'tool') + '-' + Date.now() + '.html';
      const response = await axios.post(`${BACKEND_URL}/publish`, {
        filename,
        html: generatedTool
      });
      setPublishedUrl(response.data.url);
    } catch (err) {
      alert('Failed to publish tool.');
    } finally {
      setPublishing(false);
    }
  };

  const checkIfLive = async () => {
    if (!publishedUrl) return;
    setChecking(true);
    try {
      const res = await fetch(publishedUrl, { method: 'HEAD' });
      setToolIsLive(res.ok);
    } catch {
      setToolIsLive(false);
    }
    setChecking(false);
  };

  const otherIdeas = toolIdeas.filter(idea => idea !== selectedIdea);

  // Helper to copy embed code
  const handleCopyEmbed = (url: string) => {
    const snippet = `<iframe src="${url}" width="100%" height="300" style="border:none;overflow:auto;"></iframe>`;
    navigator.clipboard.writeText(snippet);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">
            Interactive Content Generator
          </h1>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md ${tab === 'generate' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('generate')}
            >
              Generate Tool
            </button>
            <button
              className={`px-4 py-2 rounded-md ${tab === 'recent' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setTab('recent')}
            >
              Recently Published
            </button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {tab === 'generate' && (
            <div className="grid grid-cols-1 gap-6">
              <ContentInput onSubmit={handleContentSubmit} />
              {loading && <LoadingSpinner />}
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
                  <button
                    className="inline-flex items-center px-4 py-2 border border-green-600 text-sm font-medium rounded-md shadow-sm text-green-600 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={handlePublish}
                    disabled={publishing}
                  >
                    {publishing ? 'Publishing...' : 'Publish & Get Embed Code'}
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
                {publishedUrl && (
                  <div className="bg-white shadow sm:rounded-lg p-6 mt-4">
                    <h4 className="text-md font-semibold mb-2">Embed This Tool Anywhere</h4>
                    <div className="bg-yellow-100 text-yellow-800 p-4 rounded mb-4">
                      <strong>Your tool is being published to GitHub Pages.</strong>
                      <div>It may take 1–2 minutes before the embed link is live.</div>
                      <div className="mt-2">
                        <button
                          onClick={checkIfLive}
                          disabled={checking}
                          className="inline-flex items-center px-3 py-1.5 border border-blue-600 text-xs font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          {checking ? 'Checking...' : 'Check if tool is live'}
                        </button>
                      </div>
                    </div>
                    <textarea
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm mb-2"
                      rows={2}
                      readOnly
                      value={`<iframe src=\"${publishedUrl}\" width=\"100%\" height=\"700\" style=\"border:none;overflow:auto;\"></iframe>`}
                      disabled={!toolIsLive}
                    />
                    <h4 className="text-md font-semibold mb-2 mt-4">Live Published Preview</h4>
                    <div style={{ minHeight: 50 }}>
                      {toolIsLive ? (
                        <iframe
                          src={publishedUrl}
                          width="100%"
                          height="700"
                          style={{ border: 'none', overflow: 'auto' }}
                          title="Published Tool Preview"
                        />
                      ) : (
                        <div className="text-red-600 mt-2">
                          The tool is not live yet. Please wait a minute and try again.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>}
            </div>
          )}
          {tab === 'recent' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4">Recently Published Tools</h2>
              {loadingRecent ? (
                <LoadingSpinner />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentTools.map(tool => (
                    <div key={tool.url} className="bg-white shadow rounded p-4 flex flex-col items-center">
                      <iframe
                        src={tool.url}
                        width="100%"
                        height="300"
                        style={{ border: 'none', overflow: 'auto' }}
                        title={tool.name}
                      />
                      <button
                        className="mt-2 px-3 py-1.5 border border-blue-600 text-xs font-medium rounded-md shadow-sm text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={() => handleCopyEmbed(tool.url)}
                      >
                        Copy Embed
                      </button>
                      <a
                        href={tool.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 text-blue-600 underline text-xs"
                      >
                        Open in new tab
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 
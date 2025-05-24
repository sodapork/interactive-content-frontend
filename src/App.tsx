import React, { useState, useEffect } from 'react';
import ContentInput from './components/ContentInput';
import ToolPreview from './components/ToolPreview';
import LoadingSpinner from './components/LoadingSpinner';
import { ContentType } from './types';
import { generateToolIdeas, processContentForIdea, updateToolWithFeedback } from './services/contentProcessor';
import axios from 'axios';

const BACKEND_URL = 'https://interactive-content-backend.onrender.com';

function Notification({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 px-6 py-4 rounded shadow-lg text-white ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}
         style={{ minWidth: 250 }}>
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button onClick={onClose} className="ml-4 text-white font-bold">×</button>
      </div>
    </div>
  );
}

function LoadingBar() {
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden my-6">
      <div className="h-full bg-blue-500 animate-loading-bar" style={{ width: '100%' }} />
      <style>{`
        @keyframes loading-bar {
          0% { width: 0; }
          100% { width: 100%; }
        }
        .animate-loading-bar {
          animation: loading-bar 1.2s linear infinite alternate;
        }
      `}</style>
    </div>
  );
}

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
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [showStyleInput, setShowStyleInput] = useState(false);
  const [userStyle, setUserStyle] = useState<any>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (tab === 'recent') {
      setLoadingRecent(true);
      fetch(`${BACKEND_URL}/recent`)
        .then(res => res.json())
        .then(data => setRecentTools(data.tools || []))
        .finally(() => setLoadingRecent(false));
    }
  }, [tab]);

  const handleContentSubmit = async (input: string, type: ContentType, userStyleOverride?: any) => {
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
    setShowStyleInput(false);
    let blogContent = input;
    let styleSummaryValue = '';
    try {
      if (type === 'url') {
        // Call backend to extract content from URL
        const response = await axios.post(`${BACKEND_URL}/extract`, { url: input, userStyle: userStyleOverride });
        if (response.data && response.data.content && response.data.content.trim()) {
          blogContent = response.data.content;
          styleSummaryValue = response.data.styleSummary || '';
          setStyleSummary(styleSummaryValue);
          // If styleSummary is empty, prompt for user style input
          const allEmpty = styleSummaryValue && typeof styleSummaryValue === 'object' && Object.values(styleSummaryValue).every(
            s => !s || Object.values(s).every((v: any) => !v)
          );
          if (allEmpty && !userStyleOverride) {
            setShowStyleInput(true);
            setLoading(false);
            return;
          }
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
    setUpdateMessage('');
    try {
      const updatedTool = await updateToolWithFeedback(content, generatedTool, feedback);
      setGeneratedTool(updatedTool);
      setFeedback('');
      setUpdateMessage('Tool updated! Your requested changes have been applied.');
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
      setNotification({ message: 'Tool published! Your embed code is ready.', type: 'success' });
    } catch (err) {
      setNotification({ message: 'Failed to publish tool.', type: 'error' });
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

  // Helper to format tool title from filename
  function formatToolTitle(filename: string) {
    // Remove timestamp and .html extension
    let name = filename.replace(/-\d+\.html$/, '').replace(/\.html$/, '');
    // Replace dashes with spaces and capitalize each word
    return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  }

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <Notification
        message={notification?.message || ''}
        type={notification?.type || 'success'}
        onClose={() => setNotification(null)}
      />
      <header className="bg-surface shadow border-b border-accent/20">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-extrabold text-accent drop-shadow">Interactive Content Generator</h1>
          <div className="flex gap-2">
            <button
              className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${tab === 'generate' ? 'bg-accent text-white shadow' : 'bg-background text-textSecondary border border-accent/30'}`}
              onClick={() => setTab('generate')}
            >
              Generate Tool
            </button>
            <button
              className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${tab === 'recent' ? 'bg-accent text-white shadow' : 'bg-background text-textSecondary border border-accent/30'}`}
              onClick={() => setTab('recent')}
            >
              Recently Published
            </button>
          </div>
        </div>
      </header>
      <section className="bg-gradient-to-br from-accent to-accent2 py-20 text-center text-white shadow-lg border-b border-accent/30">
        <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg">Give your content the sauce</h1>
        <p className="text-2xl font-medium max-w-2xl mx-auto drop-shadow">Automatically create interactive tools based on your blog content.</p>
      </section>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {tab === 'generate' && (
            <div className="grid grid-cols-1 gap-6">
              {showStyleInput ? (
                <ContentInput
                  onSubmit={handleContentSubmit}
                  showStyleInput={true}
                  onStyleSubmit={style => {
                    setUserStyle(style);
                    handleContentSubmit(content, contentType, style);
                  }}
                />
              ) : (
                <ContentInput onSubmit={handleContentSubmit} />
              )}
              {loading && <LoadingBar />}
              {error && <div className="text-red-500 font-semibold">{error}</div>}
              {toolIdeas.length > 0 && (
                <div className="bg-surface shadow-lg rounded-xl p-6 mt-4 border border-accent/20">
                  <h4 className="text-md font-semibold mb-2 text-accent">Choose an Interactive Tool Idea</h4>
                  <ul className="space-y-2">
                    {toolIdeas.map((idea, idx) => (
                      <li key={idx}>
                        <button
                          className={`w-full text-left px-4 py-2 rounded-md border border-accent/20 transition-colors duration-150 focus:outline-none font-semibold ${selectedIdea === idea ? 'bg-accent/20 border-accent font-bold text-accent' : 'hover:bg-surface/80 text-textSecondary'}`}
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
              {generatedTool && (
                <>
                  <ToolPreview tool={generatedTool} />
                  {(!publishedUrl || publishedUrl) && (
                    <div className="bg-surface shadow-lg rounded-xl p-6 mt-4 border border-accent/20">
                      <h4 className="text-md font-semibold mb-2 text-accent">Request a Change or Edit</h4>
                      <textarea
                        className="block w-full rounded-md border border-accent/20 shadow-sm focus:border-accent focus:ring-accent sm:text-sm mb-2 bg-background text-text placeholder-textSecondary"
                        rows={3}
                        placeholder="Describe what you want to change or add (e.g., 'Add a pie chart', 'Change color to green')"
                        value={feedback}
                        onChange={e => setFeedback(e.target.value)}
                        disabled={updating}
                      />
                      <button
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-accent hover:bg-accent2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent disabled:opacity-50"
                        onClick={handleUpdateTool}
                        disabled={updating || !feedback.trim()}
                      >
                        {updating ? 'Updating...' : 'Update Tool'}
                      </button>
                      {updating && <LoadingBar />}
                      {updateMessage && !updating && (
                        <div className="mt-3 text-green-400 bg-accent/10 rounded p-2 text-sm">{updateMessage}</div>
                      )}
                    </div>
                  )}
                  {(!publishedUrl) && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <button
                        className="inline-flex items-center px-4 py-2 border border-accent text-sm font-medium rounded-md shadow-sm text-accent bg-background hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                        onClick={handlePublish}
                        disabled={publishing}
                      >
                        {publishing ? 'Publishing...' : 'Publish & Get Embed Code'}
                      </button>
                      <button
                        className="inline-flex items-center px-4 py-2 border border-accent2 text-sm font-medium rounded-md shadow-sm text-accent2 bg-background hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent2"
                        onClick={handleTryDifferentIdea}
                        disabled={loading || toolIdeas.length === 0}
                      >
                        Try Another Idea
                      </button>
                    </div>
                  )}
                </>
              )}
              {generatedTool && publishedUrl && (
                <div>
                  <ToolPreview tool={generatedTool} />
                  <div className="flex flex-col sm:flex-row gap-4 mt-4">
                    <button
                      className="inline-flex items-center px-4 py-2 border border-accent text-sm font-medium rounded-md shadow-sm text-accent bg-background hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                      onClick={() => {
                        navigator.clipboard.writeText(`<iframe src=\"${publishedUrl}\" width=\"100%\" height=\"700\" style=\"border:none;overflow:auto;\"></iframe>`);
                      }}
                    >
                      Copy Embed Code
                    </button>
                    <button
                      className="inline-flex items-center px-4 py-2 border border-accent2 text-sm font-medium rounded-md shadow-sm text-accent2 bg-background hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent2"
                      onClick={() => {
                        navigator.clipboard.writeText(generatedTool);
                      }}
                    >
                      Copy Full Tool Code
                    </button>
                  </div>
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-textSecondary">Embed Code</label>
                    <textarea
                      className="block w-full rounded-md border border-accent/20 shadow-sm focus:border-accent focus:ring-accent sm:text-sm mb-2 bg-background text-text"
                      rows={2}
                      readOnly
                      value={`<iframe src=\"${publishedUrl}\" width=\"100%\" height=\"700\" style=\"border:none;overflow:auto;\"></iframe>`}
                    />
                    <label className="block text-sm font-medium text-textSecondary mt-2">Full Tool Code</label>
                    <textarea
                      className="block w-full rounded-md border border-accent/20 shadow-sm focus:border-accent focus:ring-accent sm:text-sm mb-2 bg-background text-text"
                      rows={4}
                      readOnly
                      value={generatedTool}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
          {tab === 'recent' && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-accent">Recently Published Tools</h2>
              <div className="mb-6 flex justify-center">
                <input
                  type="text"
                  className="w-full max-w-md px-4 py-2 rounded-lg border border-accent/20 shadow focus:ring-2 focus:ring-accent focus:border-accent text-base transition-all placeholder-textSecondary bg-background text-text"
                  placeholder="Search tools by title..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loadingRecent ? (
                <LoadingBar />
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {recentTools
                      .filter(tool => formatToolTitle(tool.name).toLowerCase().includes(search.toLowerCase()))
                      .map(tool => (
                        <div key={tool.url} className="bg-surface shadow-lg rounded-xl p-4 flex flex-col items-center border border-accent/20">
                          <div className="mb-2 w-full text-center">
                            <h3 className="text-lg font-bold text-accent">{formatToolTitle(tool.name)}</h3>
                          </div>
                          <iframe
                            src={tool.url}
                            width="100%"
                            height="300"
                            style={{ border: 'none', overflow: 'auto' }}
                            title={tool.name}
                          />
                          <button
                            className="mt-2 px-3 py-1.5 border border-accent text-xs font-medium rounded-md shadow-sm text-accent bg-background hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                            onClick={() => handleCopyEmbed(tool.url)}
                          >
                            Copy Embed
                          </button>
                          <a
                            href={tool.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-accent underline text-xs"
                          >
                            Open in new tab
                          </a>
                        </div>
                      ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App; 
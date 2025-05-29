import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import ContentInput from './components/ContentInput';
import ToolPreview from './components/ToolPreview';
import LoadingSpinner from './components/LoadingSpinner';
import Dashboard from './components/dashboard/Dashboard';
import AuthWrapper from './components/auth/AuthWrapper';
import { ContentType } from './types';
import { generateToolIdeas, processContentForIdea, updateToolWithFeedback, publishTool, getMyTools } from './services/contentProcessor';
import axios from 'axios';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import { useMemberstack, useAuth } from '@memberstack/react';

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

function Generator() {
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
  const [publishedUrl, setPublishedUrl] = useState<string>('');
  const [publishing, setPublishing] = useState<boolean>(false);
  const [toolIsLive, setToolIsLive] = useState<boolean>(false);
  const [checking, setChecking] = useState<boolean>(false);
  const [publishTime, setPublishTime] = useState<number | null>(null);
  const [tab, setTab] = useState<'generate' | 'recent' | 'your-tools'>('generate');
  const [recentTools, setRecentTools] = useState<{ name: string; url: string }[]>([]);
  const [loadingRecent, setLoadingRecent] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const location = useLocation();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const memberstack = useMemberstack();
  const { getToken } = useAuth();
  const [myTools, setMyTools] = useState<any[]>([]);
  const [qualityWarnings, setQualityWarnings] = useState<string[]>([]);
  const [conversationHistory, setConversationHistory] = useState<Array<{ role: string; content: string }>>([]);

  useEffect(() => {
    checkAuth();
    if (tab === 'recent') {
      setLoadingRecent(true);
      fetch(`${BACKEND_URL}/recent`)
        .then(res => res.json())
        .then(data => setRecentTools(data.tools || []))
        .finally(() => setLoadingRecent(false));
    }
  }, [tab]);

  const checkAuth = async () => {
    try {
      const member = await memberstack.getCurrentMember();
      console.log('Memberstack.getCurrentMember() result:', member);
      const isAuthenticated = !!(member && member.data);
      console.log('isAuthenticated:', isAuthenticated);
      setIsAuthenticated(isAuthenticated);
      if (isAuthenticated) {
        setShowAuthModal(false);
      }
    } catch {
      setIsAuthenticated(false);
    }
  };

  // Add event listener for Memberstack auth state changes
  useEffect(() => {
    const handleAuthStateChange = () => {
      checkAuth();
    };

    window.addEventListener('memberstack:auth:success', handleAuthStateChange);
    window.addEventListener('memberstack:auth:logout', handleAuthStateChange);

    return () => {
      window.removeEventListener('memberstack:auth:success', handleAuthStateChange);
      window.removeEventListener('memberstack:auth:logout', handleAuthStateChange);
    };
  }, []);

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
        if (response.data && response.data.content && response.data.content.trim()) {
          blogContent = response.data.content;
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
      const ideas = await generateToolIdeas(blogContent);
      setToolIdeas(ideas);
      setContent(blogContent); // Store extracted content for later use
    } catch (err: any) {
      setError('Failed to generate tool ideas. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRerollIdeas = async () => {
    setLoading(true);
    setError(null);
    setGeneratedTool('');
    setFeedback('');
    setSelectedIdea(null);
    setShowOtherIdeas(false);
    try {
      const ideas = await generateToolIdeas(content);
      setToolIdeas(ideas);
    } catch (err: any) {
      setError('Failed to generate new tool ideas. Please try again.');
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
    setQualityWarnings([]);
    try {
      const response = await processContentForIdea(content, idea);
      setGeneratedTool(response.tool);
      if (response.warnings) {
        setQualityWarnings(response.warnings);
      }
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
      const { tool, conversationHistory: updatedHistory } = await updateToolWithFeedback(
        content, 
        generatedTool, 
        feedback,
        conversationHistory
      );
      setGeneratedTool(tool);
      setConversationHistory(updatedHistory);
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
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    setPublishing(true);
    setPublishedUrl('');
    setToolIsLive(false);
    setPublishTime(Date.now());
    try {
      const token = await getToken();
      const filename = (selectedIdea ? selectedIdea.replace(/[^a-z0-9]/gi, '-').toLowerCase() : 'tool') + '-' + Date.now() + '.html';
      const { url, tool } = await publishTool(filename, generatedTool, token);
      setPublishedUrl(url);
      setGeneratedTool(tool);
      setNotification({ message: 'Tool published! Your embed code is ready.', type: 'success' });
      // Refresh recent and my tools
      fetchMyTools();
      // If you have a fetchRecentTools function, call it here as well
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

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    checkAuth();
  };

  const handleSignOut = async () => {
    try {
      await memberstack.logout();
      setIsAuthenticated(false);
    } catch (err) {
      console.error('Failed to sign out:', err);
    }
  };

  const fetchMyTools = async () => {
    if (!isAuthenticated) return;
    const token = await getToken();
    const tools = await getMyTools(token);
    setMyTools(tools);
  };

  useEffect(() => {
    if (isAuthenticated) fetchMyTools();
  }, [isAuthenticated]);

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <Notification
        message={notification?.message || ''}
        type={notification?.type || 'success'}
        onClose={() => setNotification(null)}
      />
      <header className="bg-white shadow rounded-2xl mx-4 mt-4 mb-8 border border-border">
        <div className="max-w-7xl mx-auto py-4 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="font-bold text-xl text-black">Content Sauce</span>
          </div>
          <nav className="flex gap-8 items-center text-text font-semibold">
            <button 
              onClick={() => setTab('generate')}
              className={`hover:text-accent transition-colors ${tab === 'generate' ? 'text-accent' : ''}`}
            >
              Generate
            </button>
            <button 
              onClick={() => setTab('recent')}
              className={`hover:text-accent transition-colors ${tab === 'recent' ? 'text-accent' : ''}`}
            >
              Recent Tools
            </button>
            {isAuthenticated && (
              <button 
                onClick={() => setTab('your-tools')}
                className={`hover:text-accent transition-colors ${tab === 'your-tools' ? 'text-accent' : ''}`}
              >
                Your Tools
              </button>
            )}
          </nav>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <button 
                onClick={handleSignOut}
                className="px-5 py-2 rounded-lg font-bold bg-black text-white hover:bg-accent transition-colors"
              >
                Sign Out
              </button>
            ) : (
              <>
                <button 
                  onClick={() => {
                    setShowSignup(true);
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2 rounded-lg font-bold border border-border bg-white text-text hover:bg-accent2 transition-colors"
                >
                  Sign Up
                </button>
                <button 
                  onClick={() => {
                    setShowSignup(false);
                    setShowAuthModal(true);
                  }}
                  className="px-5 py-2 rounded-lg font-bold bg-black text-white hover:bg-accent transition-colors"
                >
                  Log In
                </button>
              </>
            )}
          </div>
        </div>
      </header>
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          {showSignup ? (
            <Signup
              onSuccess={handleAuthSuccess}
              onSwitchToLogin={() => setShowSignup(false)}
              onClose={() => setShowAuthModal(false)}
            />
          ) : (
            <Login
              onSuccess={handleAuthSuccess}
              onSwitchToSignup={() => setShowSignup(true)}
              onClose={() => setShowAuthModal(false)}
            />
          )}
        </div>
      )}
      <section className="bg-background py-20 text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-black">Give Your Content the Sauce</h1>
        <p className="text-lg text-textSecondary mb-8">Generate embeddable, interactive tools that keep your readers engaged and boost time on page.</p>
        <div className="flex justify-center gap-4">
          <button className="px-7 py-3 rounded-lg font-bold bg-accent text-white hover:bg-black transition-colors shadow">Get Started</button>
          <button className="px-7 py-3 rounded-lg font-bold border border-border bg-white text-text hover:bg-accent2 transition-colors flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M14.752 11.168l-5.197-3.027A1 1 0 008 9.027v5.946a1 1 0 001.555.832l5.197-3.027a1 1 0 000-1.664z" /></svg>
            See Example
          </button>
        </div>
        <div className="mt-10 text-textSecondary text-base max-w-2xl mx-auto">
          Empower your audience with quizzes, calculators, and widgets—no coding required. Easily embed your tools in any blog post or website.
        </div>
      </section>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {tab === 'generate' && (
            <div className="grid grid-cols-1 gap-6">
              <ContentInput onSubmit={handleContentSubmit} />
              {loading && <LoadingSpinner />}
              {error && <div className="text-red-500 font-semibold">{error}</div>}
              {toolIdeas.length > 0 && (
                <div className="bg-surface shadow-lg rounded-xl p-6 mt-4 border border-accent/20">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="text-xl font-bold text-accent">Choose an Idea to Generate Your Tool</h4>
                    <button
                      onClick={handleRerollIdeas}
                      className="px-4 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors duration-200 font-semibold"
                      disabled={loading}
                    >
                      Reroll Ideas
                    </button>
                  </div>
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
                  {qualityWarnings.length > 0 && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Quality Warnings</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <ul className="list-disc pl-5 space-y-1">
                              {qualityWarnings.map((warning, index) => (
                                <li key={index}>{warning}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {(!publishedUrl || publishedUrl) && (
                    <div className="bg-surface shadow-lg rounded-xl p-6 mt-4 border border-accent/20">
                      <h4 className="text-md font-semibold mb-2 text-accent">Request a Change or Edit</h4>
                      
                      {/* Conversation History */}
                      {conversationHistory.length > 0 && (
                        <div className="mb-4 space-y-3">
                          {conversationHistory.map((msg, index) => (
                            <div 
                              key={index} 
                              className={`p-3 rounded-lg ${
                                msg.role === 'user' 
                                  ? 'bg-accent/10 ml-4' 
                                  : 'bg-accent/5 mr-4'
                              }`}
                            >
                              <div className="text-sm font-medium mb-1">
                                {msg.role === 'user' ? 'You' : 'Assistant'}
                              </div>
                              <div className="text-textSecondary">{msg.content}</div>
                            </div>
                          ))}
                        </div>
                      )}

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
                      {updating && <LoadingSpinner />}
                      {updateMessage && !updating && (
                        <div className="mt-3 text-green-400 bg-accent/10 rounded p-2 text-sm">{updateMessage}</div>
                      )}
                    </div>
                  )}
                  {(!publishedUrl) && (
                    <div className="flex flex-col sm:flex-row gap-4 mt-4">
                      <button
                        onClick={handlePublish}
                        disabled={publishing}
                        className={`px-4 py-2 rounded-md font-semibold transition-colors duration-200 ${
                          isAuthenticated
                            ? 'bg-accent text-white hover:bg-accent/90'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
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
                <LoadingSpinner />
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
          {tab === 'your-tools' && isAuthenticated && (
            <div>
              <h2 className="text-2xl font-semibold mb-4 text-accent">Your Tools</h2>
              <div className="mb-6 flex justify-center">
                <input
                  type="text"
                  className="w-full max-w-md px-4 py-2 rounded-lg border border-accent/20 shadow focus:ring-2 focus:ring-accent focus:border-accent text-base transition-all placeholder-textSecondary bg-background text-text"
                  placeholder="Search your tools..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              {loadingRecent ? (
                <LoadingSpinner />
              ) : (
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
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthWrapper>
        <Routes>
          <Route path="/" element={<Generator />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </AuthWrapper>
    </Router>
  );
}

export default App; 
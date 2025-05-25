import React, { useState, useEffect } from 'react';
import { useMemberstack, useAuth } from '@memberstack/react';
import { getRecentTools } from '../../services/contentProcessor';

const BACKEND_URL = 'https://interactive-content-backend.onrender.com';

interface Tool {
  name: string;
  url: string;
  createdAt: string;
}

const Dashboard: React.FC = () => {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const memberstack = useMemberstack();
  const { getToken } = useAuth();

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    try {
      const token = await getToken();
      const tools = await getRecentTools(token);
      setTools(tools);
    } catch (err) {
      setError('Failed to fetch your tools');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await memberstack.openModal('LOGIN');
      window.location.reload();
    } catch (err) {
      setError('Failed to sign out.');
    }
  };

  const formatToolTitle = (filename: string) => {
    let name = filename.replace(/-\d+\.html$/, '').replace(/\.html$/, '');
    return name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  const handleCopyEmbed = (url: string) => {
    const snippet = `<iframe src="${url}" width="100%" height="300" style="border:none;overflow:auto;"></iframe>`;
    navigator.clipboard.writeText(snippet);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-accent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-surface shadow border-b border-accent/20">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-accent">Your Tools</h1>
          <button
            onClick={handleSignOut}
            className="px-4 py-2 rounded-md bg-accent/10 text-accent hover:bg-accent/20 transition-colors duration-200"
          >
            Sign Out
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => (
            <div
              key={tool.url}
              className="bg-surface shadow-lg rounded-xl p-4 flex flex-col items-center border border-accent/20"
            >
              <div className="mb-2 w-full text-center">
                <h3 className="text-lg font-bold text-accent">
                  {formatToolTitle(tool.name)}
                </h3>
              </div>
              <iframe
                src={tool.url}
                width="100%"
                height="300"
                style={{ border: 'none', overflow: 'auto' }}
                title={tool.name}
              />
              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => handleCopyEmbed(tool.url)}
                  className="px-3 py-1.5 border border-accent text-xs font-medium rounded-md shadow-sm text-accent bg-background hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
                >
                  Copy Embed
                </button>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 border border-accent2 text-xs font-medium rounded-md shadow-sm text-accent2 bg-background hover:bg-surface focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent2"
                >
                  Open Tool
                </a>
              </div>
            </div>
          ))}
        </div>

        {tools.length === 0 && !loading && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-textSecondary mb-2">
              No tools yet
            </h3>
            <p className="text-textSecondary">
              Create your first interactive tool to see it here
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard; 
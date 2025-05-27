import axios from 'axios';
// import { memberstack } from './memberstack';

const BACKEND_URL = 'https://interactive-content-backend.onrender.com';

// Helper to get auth headers
// Use the useMemberstack hook in your component to get the token if needed
const getAuthHeaders = async () => {
  // Example: const token = await memberstack.getToken();
  // return token ? { Authorization: `Bearer ${token}` } : {};
  return {};
};

interface ToolResponse {
  tool: string;
  warnings?: string[];
}

export async function generateToolIdeas(content: string): Promise<string[]> {
  const response = await axios.post(`${BACKEND_URL}/ideas`, { content });
  return response.data.ideas || [];
}

export async function processContentForIdea(content: string, idea: string): Promise<ToolResponse> {
  const response = await axios.post(`${BACKEND_URL}/generate`, { content, idea });
  return {
    tool: response.data.tool || '',
    warnings: response.data.warnings
  };
}

export async function updateToolWithFeedback(
  content: string,
  currentTool: string,
  feedback: string
): Promise<string> {
  const response = await axios.post(`${BACKEND_URL}/update`, { content, currentTool, feedback });
  return response.data.tool || '';
}

export async function publishTool(filename: string, html: string, token: string): Promise<{ url: string; tool: string }> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.post(
    `${BACKEND_URL}/publish`,
    { filename, html },
    { headers }
  );
  return { url: response.data.url, tool: response.data.tool };
}

export async function getRecentTools(token: string): Promise<Array<{ name: string; url: string; createdAt: string }>> {
  const headers = token ? { Authorization: `Bearer ${token}` } : {};
  const response = await axios.get(`${BACKEND_URL}/recent`, { headers });
  return response.data.tools || [];
}

export async function getMyTools(token: string) {
  const headers = { Authorization: `Bearer ${token}` };
  const response = await axios.get(`${BACKEND_URL}/my-tools`, { headers });
  return response.data.tools || [];
} 
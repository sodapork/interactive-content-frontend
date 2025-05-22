import axios from 'axios';

const BACKEND_URL = 'https://interactive-content-backend.onrender.com';

export async function generateToolIdeas(content: string): Promise<string[]> {
  const response = await axios.post(`${BACKEND_URL}/ideas`, { content });
  return response.data.ideas || [];
}

export async function processContentForIdea(content: string, idea: string): Promise<string> {
  const response = await axios.post(`${BACKEND_URL}/generate`, { content, idea });
  return response.data.tool || '';
}

export async function updateToolWithFeedback(
  content: string,
  currentTool: string,
  feedback: string
): Promise<string> {
  const response = await axios.post(`${BACKEND_URL}/update`, { content, currentTool, feedback });
  return response.data.tool || '';
} 
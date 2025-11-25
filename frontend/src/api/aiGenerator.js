import client from './client';

export const generateEmailFromPrompt = async (prompt) => {
  try {
    const response = await client.post('/api/ai/generate', {
      prompt,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating email:', error);
    throw error;
  }
};

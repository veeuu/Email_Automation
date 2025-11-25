import express from 'express';
import { generateEmailFromPrompt } from '../services/aiEmailGenerator.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Generate email from text prompt
router.post('/generate', verifyToken, async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Prompt is required',
      });
    }

    const result = await generateEmailFromPrompt(prompt);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error || 'Failed to generate email',
      });
    }

    res.json({
      success: true,
      html: result.html,
      prompt: result.prompt,
    });
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
    });
  }
});

export default router;

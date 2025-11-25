import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback template generator for testing
function generateFallbackTemplate(prompt) {
  const colors = {
    primary: '#a78bfa',
    secondary: '#f0abfc',
    accent: '#86efac',
  };

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    <!-- Header -->
    <div style="background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); padding: 40px 20px; text-align: center;">
      <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">Email Template</h1>
    </div>
    
    <!-- Content -->
    <div style="padding: 40px 20px;">
      <p style="margin: 0 0 20px 0; color: #333; font-size: 16px; line-height: 1.6;">
        ${prompt}
      </p>
      
      <!-- CTA Button -->
      <div style="text-align: center; margin: 30px 0;">
        <a href="#" style="display: inline-block; background: linear-gradient(135deg, ${colors.primary} 0%, ${colors.secondary} 100%); color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Learn More
        </a>
      </div>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="margin: 0; color: #666; font-size: 12px;">
        © 2025 Your Company. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>`;
}

export async function generateEmailFromPrompt(prompt) {
  try {
    const model = genAI.getGenerativeModel({ model: process.env.GEMINI_MODEL });

    const systemPrompt = `You are an expert email template designer. Generate a professional, modern HTML email template based on the user's description.

Requirements:
- Return ONLY valid HTML (no markdown, no explanations)
- Use inline CSS styles (no <style> tags)
- Make it responsive and mobile-friendly
- Use a clean, professional design with pastel colors
- Include proper email client compatibility
- Wrap content in a main container with max-width: 600px
- Use semantic HTML tags
- Ensure good contrast and readability

Start with <!DOCTYPE html> and end with </html>`;

    const message = `Generate an HTML email template for: ${prompt}`;

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt + '\n\n' + message }],
        },
      ],
    });

    const response = result.response;
    const htmlContent = response.text();

    // Extract HTML if wrapped in markdown code blocks
    const htmlMatch = htmlContent.match(/```html\n?([\s\S]*?)\n?```/) || 
                      htmlContent.match(/```\n?([\s\S]*?)\n?```/);
    
    const cleanHtml = htmlMatch ? htmlMatch[1] : htmlContent;

    return {
      success: true,
      html: cleanHtml,
      prompt: prompt,
    };
  } catch (error) {
    console.error('Error generating email with Gemini:', error.message);
    console.log('Using fallback template generator...');
    
    // Use fallback template if API fails
    return {
      success: true,
      html: generateFallbackTemplate(prompt),
      prompt: prompt,
      fallback: true,
    };
  }
}

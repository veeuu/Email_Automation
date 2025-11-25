import { useState } from 'react';
import { generateEmailFromPrompt } from '../api/aiGenerator';

export default function AIEmailGenerator({ onTemplateGenerated, onClose }) {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState('');
  const [error, setError] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [isFallback, setIsFallback] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('Please enter a description for your email');
      return;
    }

    setLoading(true);
    setError('');
    setGeneratedHtml('');

    try {
      const result = await generateEmailFromPrompt(prompt);
      if (result.success) {
        setGeneratedHtml(result.html);
        setIsFallback(result.fallback || false);
      } else {
        setError(result.error || 'Failed to generate email');
      }
    } catch (err) {
      setError('Error generating email. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }

    onTemplateGenerated({
      name: templateName,
      html: generatedHtml,
      prompt: prompt,
    });

    // Reset form
    setPrompt('');
    setTemplateName('');
    setGeneratedHtml('');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">AI Email Generator</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Prompt Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Describe your email
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="E.g., 'A promotional email for a summer sale with 50% off discount, include product images, call-to-action button, and footer with social links'"
              className="w-full h-24 p-3 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">
              Be specific about the content, tone, and design you want
            </p>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold py-3 rounded-lg hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {loading ? 'Generating...' : 'Generate Email'}
          </button>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Generated Email Preview */}
          {generatedHtml && (
            <div className="space-y-4">
              {isFallback && (
                <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 p-3 rounded-lg text-sm">
                  ⚠️ Using template preview. For AI-powered generation, please add a valid Gemini API key to your .env file.
                </div>
              )}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Email Preview
                </h3>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
                  <iframe
                    srcDoc={generatedHtml}
                    className="w-full h-96 border-0 rounded"
                    title="Email Preview"
                  />
                </div>
              </div>

              {/* Save Template Section */}
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 space-y-3">
                <h3 className="font-semibold text-gray-800">Save as Template</h3>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="Enter template name"
                  className="w-full p-2 border border-purple-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleSaveTemplate}
                    disabled={!templateName.trim()}
                    className="flex-1 bg-green-500 text-white font-semibold py-2 rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    Save Template
                  </button>
                  <button
                    onClick={() => {
                      setGeneratedHtml('');
                      setPrompt('');
                      setTemplateName('');
                    }}
                    className="flex-1 bg-gray-300 text-gray-700 font-semibold py-2 rounded-lg hover:bg-gray-400 transition"
                  >
                    Generate Again
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

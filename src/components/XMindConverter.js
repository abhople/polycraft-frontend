import React, { useState, useEffect } from 'react';
import { Upload, Download, Copy, FileText, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';
import { generateAndDownloadXMind, validateBedrockInput, exampleBedrockOutput } from '../utils/bedrockToXMind';
import GlassCard from './ui/GlassCard';
import Button from './ui/Button';
import IconButton from './ui/IconButton';

const XMindConverter = () => {
  const [bedrockInput, setBedrockInput] = useState('');
  const [filename, setFilename] = useState('xmind-map-policy');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const [copySuccess, setCopySuccess] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  useEffect(() => {
    // Check for theme preference - check both localStorage and document class
    const savedTheme = localStorage.getItem('polycraft-theme');
    const hasLightClass = document.documentElement.classList.contains('light');
    const isDark = hasLightClass ? false : (savedTheme ? savedTheme === 'dark' : true);
    console.log('XMindConverter theme detection:', { savedTheme, hasLightClass, isDark, documentClass: document.documentElement.className });
    setIsDarkMode(isDark);
  }, []);

  const handleCopyInput = async () => {
    if (!bedrockInput.trim()) return;
    
    try {
      await navigator.clipboard.writeText(bedrockInput);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = bedrockInput;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setBedrockInput(value);
    
    // Validate input in real-time
    const validationResult = validateBedrockInput(value);
    setValidation(validationResult);
    
    // Clear previous messages
    setError('');
    setSuccess('');
    setCopySuccess(false);
  };

  const handleFilenameChange = (e) => {
    setFilename(e.target.value);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setBedrockInput(event.target.result);
        const validationResult = validateBedrockInput(event.target.result);
        setValidation(validationResult);
      };
      reader.readAsText(file);
    }
  };

  const handleGenerate = async () => {
    if (!bedrockInput.trim()) {
      setError('Please enter or upload Bedrock output');
      return;
    }

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsGenerating(true);
    setError('');
    setSuccess('');

    try {
      // Ensure filename has .xmind extension
      const filenameWithExtension = filename.endsWith('.xmind') ? filename : `${filename}.xmind`;
      await generateAndDownloadXMind(bedrockInput, filenameWithExtension);
      setSuccess('XMind file generated and downloaded successfully!');
    } catch (err) {
      setError('Failed to generate XMind file: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLoadExample = () => {
    setBedrockInput(exampleBedrockOutput);
    const validationResult = validateBedrockInput(exampleBedrockOutput);
    setValidation(validationResult);
    setError('');
    setSuccess('');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className={`text-3xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-black'}`}>
          XMind Converter
        </h2>
        <p className={`${isDarkMode ? 'text-text-muted' : 'text-black'}`}>
          Convert Policy Analysis output into structured XMind files
        </p>
      </div>

      <div className="lg:grid lg:grid-cols-2 gap-8">
        {/* Input Card */}
        <GlassCard>
          <div className="space-y-6">
            <div>
              <label htmlFor="bedrockInput" className={`text-sm font-medium ${isDarkMode ? 'text-text-muted' : 'text-black'}`}>
                Policy Analysis output
              </label>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Paste your policy analysis results here to convert them into structured XMind mind maps
              </p>
              <textarea
                id="bedrockInput"
                value={bedrockInput}
                onChange={handleInputChange}
                placeholder="Paste your policy analysis output here..."
                className="mt-2 h-64 w-full resize-y rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[15px] text-white placeholder:text-[#8f95b2] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0 transition-all duration-200"
              />
              
              {/* Validation Status */}
              {bedrockInput && (
                <div className="mt-2 flex items-center gap-2">
                  {validation.isValid ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-xs ${validation.isValid ? 'text-green-400' : 'text-red-400'}`}>
                    {validation.message}
                  </span>
                </div>
              )}
            </div>

            {/* File Upload */}
            <div>
              <label className={`text-sm font-medium mb-1 block ${isDarkMode ? 'text-text-muted' : 'text-black'}`}>
                Or upload a file
              </label>
              <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Upload TXT or JSON files containing policy analysis data
              </p>
              <div className="relative">
                <input
                  type="file"
                  accept=".txt,.json"
                  onChange={handleFileUpload}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex items-center gap-3 p-4 border border-white/10 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                  <Upload className={`w-5 h-5 ${isDarkMode ? 'text-text-muted' : 'text-gray-600'}`} />
                  <span className={`text-sm ${isDarkMode ? 'text-text-muted' : 'text-gray-600'}`}>Click to upload file</span>
                </div>
              </div>
            </div>

            {/* Filename Input */}
            <div>
              <label htmlFor="filename" className={`text-sm font-medium ${isDarkMode ? 'text-text-muted' : 'text-black'}`}>
                Filename (without extension)
              </label>
              <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                Choose a name for your XMind file - .xmind extension will be added automatically
              </p>
              <input
                id="filename"
                type="text"
                value={filename}
                onChange={handleFilenameChange}
                className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[15px] text-white placeholder:text-[#8f95b2] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0 transition-all duration-200"
                placeholder="Enter filename..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !bedrockInput.trim() || !validation.isValid}
                loading={isGenerating}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generating XMind...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate & Download
                  </>
                )}
              </Button>
              
              <Button
                onClick={handleLoadExample}
                variant="secondary"
                className="sm:w-auto"
              >
                <FileText className="mr-2 h-4 w-4" />
                Load Example
              </Button>
            </div>

            {/* Copy Button */}
            {bedrockInput && (
              <div className="flex justify-end">
                <IconButton
                  onClick={handleCopyInput}
                  title="Copy input"
                  className={copySuccess ? 'bg-green-500/20 border-green-500/40' : ''}
                >
                  {copySuccess ? (
                    <CheckCircle className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </IconButton>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
                {success}
              </div>
            )}
          </div>
        </GlassCard>

        {/* Preview Card */}
        <GlassCard>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className={`text-sm ${isDarkMode ? 'text-text-muted' : 'text-black'}`}>Input Preview</span>
                <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                  Preview your input data before converting to XMind format
                </p>
              </div>
              {bedrockInput && (
                <div className="flex gap-2">
                  <IconButton title="Copy" onClick={handleCopyInput}>
                    <Copy className="w-4 h-4" />
                  </IconButton>
                </div>
              )}
            </div>

            <div className="min-h-[300px]">
              {bedrockInput ? (
                <pre 
                  className="whitespace-pre-wrap text-[15px] leading-6 font-mono bg-white/5 rounded-xl p-4 border border-white/10" 
                  style={{
                    color: isDarkMode ? '#ffffff !important' : '#000000 !important',
                    backgroundColor: 'rgba(255, 255, 255, 0.05) !important'
                  }}
                >
                  {bedrockInput}
                </pre>
              ) : (
                <div className={`flex items-center justify-center h-48 ${isDarkMode ? 'text-text-muted' : 'text-black'}`}>
                  <div className="text-center">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Your Policy Analysis output will appear here</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default XMindConverter;
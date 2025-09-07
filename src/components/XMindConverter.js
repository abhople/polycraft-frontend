import React, { useState } from 'react';
import { generateAndDownloadXMind, validateBedrockInput, exampleBedrockOutput } from '../utils/bedrockToXMind';
import './XMindConverter.css';

const XMindConverter = () => {
  const [bedrockInput, setBedrockInput] = useState('');
  const [filename, setFilename] = useState('bedrock-output');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [validation, setValidation] = useState({ isValid: true, message: '' });
  const [copySuccess, setCopySuccess] = useState(false);

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

  const handleGenerateXMind = async () => {
    if (!bedrockInput.trim()) {
      setError('Please enter some text to convert');
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
      const downloadedFilename = await generateAndDownloadXMind(bedrockInput, filename);
      setSuccess(`✅ XMind file "${downloadedFilename}" has been downloaded successfully!`);
    } catch (err) {
      setError(`Failed to generate XMind file: ${err.message}`);
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

  const handleClear = () => {
    setBedrockInput('');
    setFilename('bedrock-output');
    setError('');
    setSuccess('');
    setValidation({ isValid: true, message: '' });
  };

  return (
    <div className="xmind-converter">
      <div className="converter-header">
        <h2>🧠 Bedrock to XMind Converter</h2>
        <p className="converter-description">
          Convert your tab-indented Bedrock output into a downloadable XMind mind map file.
        </p>
      </div>

      <div className="input-section">
        <div className="input-group">
          <div className="input-header">
            <label htmlFor="bedrockInput" className="input-label">
              Bedrock Output (Tab-indented text):
            </label>
            {bedrockInput.trim() && (
              <button
                onClick={handleCopyInput}
                className={`copy-input-button ${copySuccess ? 'success' : ''}`}
                title="Copy input text to clipboard"
              >
                {copySuccess ? '✅ Copied!' : '📋 Copy Input'}
              </button>
            )}
          </div>
          <textarea
            id="bedrockInput"
            value={bedrockInput}
            onChange={handleInputChange}
            placeholder="Paste your tab-indented Bedrock output here...

Example:
BusinessPropertyInsurance
	Coverage
		Rule: FireCoverage
		Rule: FloodCoverage
	Exclusions
		Condition: WearAndTearExcluded"
            className={`text-input ${!validation.isValid ? 'invalid' : ''}`}
            rows="12"
          />
          {!validation.isValid && (
            <div className="validation-warning">
              ⚠️ {validation.message}
            </div>
          )}
        </div>

        <div className="filename-group">
          <label htmlFor="filename" className="input-label">
            Filename (without extension):
          </label>
          <input
            id="filename"
            type="text"
            value={filename}
            onChange={handleFilenameChange}
            placeholder="bedrock-output"
            className="filename-input"
          />
        </div>
      </div>

      <div className="action-buttons">
        <button
          onClick={handleGenerateXMind}
          disabled={isGenerating || !bedrockInput.trim() || !validation.isValid}
          className="generate-button"
        >
          {isGenerating ? '🔄 Generating XMind...' : '📥 Generate & Download XMind'}
        </button>

        <div className="secondary-buttons">
          <button
            onClick={handleLoadExample}
            className="example-button"
            disabled={isGenerating}
          >
            📋 Load Example
          </button>
          <button
            onClick={handleClear}
            className="clear-button"
            disabled={isGenerating}
          >
            🗑️ Clear
          </button>
        </div>
      </div>

      {error && (
        <div className="error-message">
          ❌ {error}
        </div>
      )}

      {success && (
        <div className="success-message">
          {success}
        </div>
      )}

      <div className="help-section">
        <h3>💡 How to use:</h3>
        <ul>
          <li>Paste your tab-indented text from Bedrock into the text area</li>
          <li>Make sure the first line is a root-level item (no tabs)</li>
          <li>Use tabs to create hierarchical structure</li>
          <li>Click "Generate & Download XMind" to create and download your mind map</li>
        </ul>
      </div>
    </div>
  );
};

export default XMindConverter;

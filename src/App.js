import React, { useState } from 'react';
import './App.css';
import XMindConverter from './components/XMindConverter';

function App() {
  const [activeTab, setActiveTab] = useState('insurance');
  const [insuranceSpec, setInsuranceSpec] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(response);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = response;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const handleSubmit = async () => {
    if (!insuranceSpec.trim()) {
      setError('Please enter insurance specifications');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    setCopySuccess(false);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/invoke-agent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId: process.env.REACT_APP_AGENT_ID || 'your-agent-id-here',
          inputText: insuranceSpec,
          sessionId: `session-${Date.now()}`
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResponse(data.response);
      } else {
        setError(data.error || 'Failed to get response from agent');
      }
    } catch (err) {
      setError('Failed to connect to backend server. Make sure the backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="container">
        <h1>Polycraft Assistant</h1>
        <p className="description">
          AI-powered tools for insurance specifications and mind mapping.
        </p>

        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'insurance' ? 'active' : ''}`}
            onClick={() => setActiveTab('insurance')}
          >
            🏢 Insurance Assistant
          </button>
          <button
            className={`tab-button ${activeTab === 'xmind' ? 'active' : ''}`}
            onClick={() => setActiveTab('xmind')}
          >
            🧠 XMind Converter
          </button>
        </div>

        {activeTab === 'insurance' && (
          <div className="tab-content">
            <h2>Insurance Specification Assistant</h2>
            <p className="tab-description">
              Enter your insurance specifications below and get AI-powered assistance from our Bedrock agent.
            </p>
            
            <div className="input-section">
              <label htmlFor="insuranceSpec" className="input-label">
                Insurance Specifications:
              </label>
              <textarea
                id="insuranceSpec"
                value={insuranceSpec}
                onChange={(e) => setInsuranceSpec(e.target.value)}
                placeholder="Describe your insurance needs, coverage requirements, or ask questions about insurance policies..."
                className="text-input"
                rows="6"
              />
            </div>

            <button 
              onClick={handleSubmit} 
              disabled={loading || !insuranceSpec.trim()}
              className="submit-button"
            >
              {loading ? 'Getting Response...' : 'Get AI Response'}
            </button>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {response && (
              <div className="response-section">
                <div className="response-header">
                  <h3>AI Response:</h3>
                  <button
                    onClick={handleCopyResponse}
                    className={`copy-button ${copySuccess ? 'success' : ''}`}
                    title="Copy response to clipboard"
                  >
                    {copySuccess ? '✅ Copied!' : '📋 Copy'}
                  </button>
                </div>
                <div className="response-content">
                  {response}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'xmind' && (
          <div className="tab-content">
            <XMindConverter />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Download, Sparkles, Upload, FileText, X, Bot, RotateCcw, Sun, Moon, CheckCircle, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { generateAndDownloadXMind } from './utils/bedrockToXMind';
import XMindConverter from './components/XMindConverter';
import Container from './components/ui/Container';
import GlassCard from './components/ui/GlassCard';
import SegmentedTabs from './components/ui/SegmentedTabs';
import Button from './components/ui/Button';
import IconButton from './components/ui/IconButton';
import Toast from './components/ui/Toast';
import Spinner from './components/ui/Spinner';

function App() {
  const [activeTab, setActiveTab] = useState('insurance');
  const [insuranceSpec, setInsuranceSpec] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  // const [copySuccess, setCopySuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [xmindFilename, setXmindFilename] = useState('xmind-map-policy');
  const [isGeneratingXMind, setIsGeneratingXMind] = useState(false);
  const [xmindError, setXmindError] = useState('');
  const [xmindSuccess, setXmindSuccess] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference, default to dark
    const savedTheme = localStorage.getItem('polycraft-theme');
    return savedTheme ? savedTheme === 'dark' : true;
  });

  // Theme toggle function
  const toggleTheme = () => {
    const newTheme = !isDarkMode;
    setIsDarkMode(newTheme);
    localStorage.setItem('polycraft-theme', newTheme ? 'dark' : 'light');
  };

  // Apply theme to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.add('light');
    }
  }, [isDarkMode]);

  // Sample chips for autofill
  const samples = [
    {
      display: "NextGen Retail Cyber Liability Policy...",
      full: `NextGen Retail Cyber Liability Policy

Coverage:
Protects the business against first-party losses such as data loss, system interruptions, ransomware attacks, and any business interruptions caused by cyber incidents.
Covers third-party liabilities, including privacy breaches, regulatory fines, and legal defense costs.
Includes coverage for extortion threats and the costs required to hire forensic experts.
Offers optional coverage for reputational harm and crisis management support.

Exclusions:
Does not cover losses resulting from known vulnerabilities that were left unpatched for more than 30 days.
Excludes losses caused by employees acting maliciously or fraudulently.
Acts of war or terrorism, including cyber-terrorism, are excluded unless specifically endorsed in the policy.
Claims arising from prior known incidents disclosed before the policy start date are not covered.

Limits:
Aggregate limit of $20,000,000 per policy period.
Per incident limit of $5,000,000.
Sub-limits: $1,000,000 for reputational harm, $500,000 for regulatory fines.
Deductibles: $50,000 per incident, $100,000 specifically for ransomware payouts.

Conditions:
Insured must implement multi-factor authentication and conduct regular security audits.
All cyber incidents must be reported immediately, within 24 hours.
Compliance with ISO 27001 or NIST cybersecurity frameworks is recommended for full coverage.
Annual penetration testing is required for all critical systems.`
    },
    {
      display: "NextGen Retail Cyber Liability Policy (JSON)...",
      full: `{
  "policyName": "NextGen Retail Cyber Liability Policy",
  "policyType": "Cyber",
  "sections": [
    {
      "title": "Coverage",
      "details": [
        "Covers first-party losses: data loss, system interruption, ransomware, and business interruption due to cyber incidents",
        "Covers third-party liability: privacy breach, regulatory fines, and defense costs",
        "Includes coverage for extortion threats and costs to engage forensic experts",
        "Optional coverage for reputational harm and crisis management"
      ]
    },
    {
      "title": "Exclusions",
      "details": [
        "Does not cover losses due to known vulnerabilities unpatched within 30 days",
        "Excludes losses caused by employees acting maliciously or fraudulently",
        "Acts of war or terrorism, including cyber-terrorism, are excluded unless specifically endorsed",
        "Prior known incidents disclosed before inception date are excluded"
      ]
    },
    {
      "title": "Limits",
      "details": [
        "Aggregate limit: $20,000,000",
        "Per incident limit: $5,000,000",
        "Sub-limits: $1,000,000 for reputational harm, $500,000 for regulatory fines",
        "Deductible: $50,000 per incident, $100,000 for ransomware payouts"
      ]
    },
    {
      "title": "Conditions",
      "details": [
        "Insured must maintain multi-factor authentication and regular security audits",
        "Immediate reporting of incidents within 24 hours",
        "Compliance with ISO 27001 or NIST cyber frameworks recommended for full coverage",
        "Annual penetration testing required for critical systems"
      ]
    }
  ]
}`
    }
  ];

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

  const handleDownloadResponse = () => {
    const blob = new Blob([response], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai-response.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleSampleClick = (sample) => {
    const text = typeof sample === 'string' ? sample : sample.full;
    setInsuranceSpec(text);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check file size (10MB limit)
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }

      // Get file extension
      const fileName = file.name.toLowerCase();
      const allowedExtensions = ['.txt', '.pdf', '.doc', '.docx', '.csv', '.json'];
      const hasValidExtension = allowedExtensions.some(ext => fileName.endsWith(ext));
      
      // Check MIME type or file extension
      const allowedMimeTypes = [
        'text/plain',
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv',
        'application/json',
        'text/csv'
      ];
      
      const hasValidMimeType = allowedMimeTypes.includes(file.type);
      
      if (hasValidMimeType || hasValidExtension) {
        setUploadedFile(file);
        setError('');
        console.log('File uploaded successfully:', file.name, 'Type:', file.type);
        
        // Read file content for text files
        if (file.type === 'text/plain' || fileName.endsWith('.txt') || fileName.endsWith('.csv') || fileName.endsWith('.json')) {
          const reader = new FileReader();
          reader.onload = (e) => {
            const content = e.target.result;
            setInsuranceSpec(content);
          };
          reader.onerror = () => {
            setError('Failed to read file content');
          };
          reader.readAsText(file);
        }
      } else {
        setError(`Please upload a supported file type (TXT, PDF, DOC, DOCX, CSV, JSON). Detected type: ${file.type || 'unknown'}`);
        console.log('File rejected:', file.name, 'Type:', file.type);
      }
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setInsuranceSpec(''); // Clear the textarea when file is removed
    // Reset the file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleReset = () => {
    setInsuranceSpec('');
    setUploadedFile(null);
    setResponse('');
    setError('');
    setXmindError('');
    setXmindSuccess('');
    // Reset the file input
    const fileInput = document.getElementById('file-upload');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleGenerateXMind = async () => {
    if (!response.trim()) {
      setXmindError('Please generate a policy analysis first');
      return;
    }

    setIsGeneratingXMind(true);
    setXmindError('');
    setXmindSuccess('');

    try {
      const filenameWithExtension = xmindFilename.endsWith('.xmind') ? xmindFilename : `${xmindFilename}.xmind`;
      await generateAndDownloadXMind(response, filenameWithExtension);
      setXmindSuccess('XMind file generated and downloaded successfully!');
    } catch (err) {
      setXmindError('Failed to generate XMind file: ' + err.message);
    } finally {
      setIsGeneratingXMind(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Create a synthetic event object to reuse the existing handler
      const syntheticEvent = {
        target: {
          files: [file]
        }
      };
      handleFileUpload(syntheticEvent);
    }
  };

  const triggerConfetti = () => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#7c8cff', '#a78bfa', '#e879f9']
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!insuranceSpec.trim() && !uploadedFile) {
      setError('Please enter insurance specifications or upload a document');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');
    // setCopySuccess(false);

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
        setShowToast(true);
        triggerConfetti();
      } else {
        setError(data.error || 'Failed to get response from agent');
      }
    } catch (err) {
      setError('Failed to connect to backend server. Make sure the backend is running on port 3000.');
    } finally {
      setLoading(false);
    }
  }, [insuranceSpec]);

  // Keyboard shortcut for submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        if (!loading && insuranceSpec.trim()) {
          handleSubmit();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [loading, insuranceSpec, handleSubmit]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Travelers-inspired professional backgrounds */}
      {isDarkMode ? (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-gray-50 via-white to-gray-100" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent" />
        </>
      )}
      
      <main className="relative z-10">
        <Container>
          {/* Header */}
          <header className="mb-10 text-center relative">
            {/* Theme Toggle */}
            <div className="absolute top-0 right-0">
              <button
                onClick={toggleTheme}
                className={`p-3 rounded-md transition-all duration-300 ${
                  isDarkMode 
                    ? 'bg-white/10 hover:bg-white/20 border border-white/20' 
                    : 'bg-gray-100 hover:bg-gray-200 border border-gray-300'
                }`}
                title={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {isDarkMode ? (
                  <Sun className="w-5 h-5 text-white" />
                ) : (
                  <Moon className="w-5 h-5 text-gray-700" />
                )}
              </button>
            </div>
            
            <h1 className={`text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Polycraft
            </h1>
            <p className={`mt-4 text-lg md:text-xl font-normal ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
              The Craftsmanship Behind Great Insurance Products
            </p>
            
            {/* Minimalist Help Instructions */}
            <div className={`mt-8 max-w-2xl mx-auto ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              <div className="text-center space-y-3">
                <p className="text-base font-medium">How it works:</p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span>Describe your insurance needs</span>
                  </div>
                  <div className="hidden sm:block text-gray-400 text-lg">→</div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span>Get AI-powered analysis</span>
                  </div>
                  <div className="hidden sm:block text-gray-400 text-lg">→</div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span>Convert to XMind maps</span>
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Segmented Tabs */}
          <div className="mb-8 flex justify-center">
            <SegmentedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          {activeTab === 'insurance' && (
            <div className="space-y-8">
              {/* Input Card */}
              <GlassCard>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="specs" className={`text-base font-semibold ${isDarkMode ? 'text-gray-800' : 'text-black'}`}>
                      Insurance Specifications
                    </label>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Describe your coverage needs, policy requirements, or ask specific questions about insurance products
                    </p>
                    <textarea
                      id="specs"
                      value={insuranceSpec}
                      onChange={(e) => setInsuranceSpec(e.target.value)}
                      placeholder="Start by describing your insurance needs, coverage requirements, or ask questions about policies..."
                      className="mt-3 h-56 w-full resize-y rounded px-4 py-3 text-base leading-normal focus:outline-none transition-all duration-300"
                      maxLength={2000}
                    />
                    <div className="mt-2 text-right text-sm text-gray-500">
                      {insuranceSpec.length}/2000
                    </div>
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <label htmlFor="file-upload" className={`text-base font-semibold ${isDarkMode ? 'text-gray-900' : 'text-black'}`}>
                      Upload Document (Optional)
                    </label>
                    <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Upload existing policy documents, coverage specifications, or reference materials for analysis
                    </p>
                    <div className="mt-3">
                      {!uploadedFile ? (
                        <label
                          htmlFor="file-upload"
                          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-blue-500 transition-all duration-300"
                          onDragOver={handleDragOver}
                          onDragEnter={handleDragEnter}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <div className="flex flex-col items-center justify-center pt-4 pb-4">
                            <Upload className="w-8 h-8 mb-2 text-gray-400" />
                            <p className={`mb-1 text-base ${isDarkMode ? 'text-gray-700' : 'text-black'}`}>
                              <span className="font-semibold">Click to upload</span> or drag and drop
                            </p>
                            <p className={`text-sm ${isDarkMode ? 'text-gray-600' : 'text-gray-700'}`}>TXT, PDF, DOC, DOCX, CSV, JSON (MAX. 10MB)</p>
                          </div>
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileUpload}
                            accept=".txt,.pdf,.doc,.docx,.csv,.json"
                          />
                        </label>
                      ) : (
                        <div className="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/10">
                          <div className="flex items-center space-x-3">
                            <FileText className="w-5 h-5 text-white/80" />
                            <div>
                              <p className="text-sm text-white font-medium">{uploadedFile.name}</p>
                              <p className="text-xs text-white/60">
                                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                          <button
                            onClick={handleRemoveFile}
                            className="p-1 hover:bg-white/10 rounded-lg transition-colors duration-200"
                          >
                            <X className="w-4 h-4 text-white/60 hover:text-white" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Sample Chips */}
                  <div>
                    <p className={`text-base font-semibold mb-1 ${isDarkMode ? 'text-gray-800' : 'text-black'}`}>Quick samples:</p>
                    <p className={`text-xs mb-3 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      Click any sample to auto-fill the text area with example content
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {samples.map((sample, index) => (
                        <button
                          key={index}
                          onClick={() => handleSampleClick(sample)}
                          className="rounded px-4 py-2 bg-blue-50 hover:bg-blue-100 text-sm font-medium text-blue-800 border border-blue-300 transition-all duration-300 hover:border-blue-400"
                        >
                          {typeof sample === 'string' ? sample : sample.display}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubmit}
                      disabled={loading || (!insuranceSpec.trim() && !uploadedFile)}
                      className="craft-policy-button flex-1 h-12 text-base font-semibold rounded inline-flex items-center justify-center px-6 py-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed"
                      style={{
                        backgroundColor: '#e01719',
                        border: 'none',
                        color: '#ffffff !important'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.backgroundColor = '#c01517';
                        e.target.style.color = '#ffffff';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.backgroundColor = '#e01719';
                        e.target.style.color = '#ffffff';
                      }}
                    >
                      {loading ? (
                        <>
                          <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                          Crafting Magic...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Craft My Policy
                        </>
                      )}
                    </button>
                    
                    <Button
                      onClick={handleReset}
                      disabled={loading}
                      variant="outline"
                      className="px-4 h-12 text-base font-semibold rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
                    >
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Reset
                    </Button>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                      {error}
                    </div>
                  )}
                </div>
              </GlassCard>

              {/* Response Card */}
              <GlassCard>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className={`text-base font-semibold ${isDarkMode ? 'text-gray-800' : 'text-black'}`}>Policy Analysis</span>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        AI-generated analysis of your insurance specifications with actionable insights
                      </p>
                    </div>
                    {response && (
                      <div className="flex items-center gap-2">
                        <IconButton title="Copy" onClick={handleCopyResponse}>
                          <Copy className="w-4 h-4" />
                        </IconButton>
                        {copySuccess && (
                          <span className="text-sm text-green-600 font-medium animate-pulse">
                            Copied!
                          </span>
                        )}
                        <IconButton title="Download" onClick={handleDownloadResponse}>
                          <Download className="w-4 h-4" />
                        </IconButton>
                      </div>
                    )}
                  </div>

                  <div className="min-h-[200px]">
                    {loading ? (
                      <div className="flex flex-col items-center justify-center h-48 space-y-4">
                        <div className="relative">
                          <Sparkles className="w-12 h-12 text-brand-primary animate-pulse" />
                          <div className="absolute inset-0 w-12 h-12 border-4 border-brand-primary/60 rounded-full animate-spin"></div>
                          <div className="absolute inset-0 w-16 h-16 border-3 border-brand-accent/50 rounded-full animate-ping"></div>
                          <div className="absolute inset-0 w-20 h-20 border-2 border-brand-secondary/40 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                          <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand-primary rounded-full animate-bounce"></div>
                          <div className="absolute -bottom-2 -left-2 w-3 h-3 bg-brand-accent rounded-full animate-bounce" style={{animationDelay: '0.3s'}}></div>
                          <div className="absolute -top-1 -left-3 w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{animationDelay: '0.6s'}}></div>
                        </div>
                        <div className="text-center">
                          <p className={`font-semibold text-lg ${isDarkMode ? 'text-gray-800' : 'text-black'}`}>Crafting your policy masterpiece...</p>
                          <p className={`text-base mt-1 ${isDarkMode ? 'text-gray-600' : 'text-gray-700'}`}>AI is weaving insurance magic</p>
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-brand-primary rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-brand-accent rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                          <div className="w-2 h-2 bg-brand-secondary rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                        </div>
                      </div>
                    ) : response ? (
                      <pre className={`whitespace-pre-wrap text-base leading-6 font-sans ${isDarkMode ? 'text-gray-700' : 'text-black'}`}>
                        {response}
                      </pre>
                    ) : (
                      <div className={`flex items-center justify-center h-48 ${isDarkMode ? 'text-gray-500' : 'text-black'}`}>
                        <div className="text-center">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-base">Your response will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>

              {/* XMind Conversion Section */}
              {response && (
                <GlassCard>
                  <div className="space-y-6">
                    <div>
                      <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                        Convert to XMind Map
                      </h3>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        Transform your policy analysis into a structured XMind mind map for better visualization
                      </p>
                    </div>

                    {/* Filename Input */}
                    <div>
                      <label htmlFor="xmind-filename" className={`text-sm font-medium ${isDarkMode ? 'text-text-muted' : 'text-black'}`}>
                        Filename (without extension)
                      </label>
                      <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                        Choose a name for your XMind file - .xmind extension will be added automatically
                      </p>
                      <input
                        id="xmind-filename"
                        type="text"
                        value={xmindFilename}
                        onChange={(e) => setXmindFilename(e.target.value)}
                        className="mt-2 w-full rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[15px] text-white placeholder:text-[#8f95b2] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0 transition-all duration-200"
                        placeholder="Enter filename..."
                      />
                    </div>

                    {/* Generate XMind Button */}
                    <div className="flex justify-center">
                      <button
                        onClick={handleGenerateXMind}
                        disabled={isGeneratingXMind || !response.trim()}
                        className="inline-flex items-center justify-center px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 disabled:opacity-60 disabled:cursor-not-allowed"
                        style={{
                          backgroundColor: '#e01719',
                          border: 'none',
                          color: '#ffffff !important'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.backgroundColor = '#c01517';
                          e.target.style.color = '#ffffff';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.backgroundColor = '#e01719';
                          e.target.style.color = '#ffffff';
                        }}
                      >
                        {isGeneratingXMind ? (
                          <>
                            <Sparkles className="mr-2 h-4 w-4 animate-pulse" />
                            Generating XMind...
                          </>
                        ) : (
                          <>
                            <Download className="mr-2 h-4 w-4" />
                            Generate & Download XMind
                          </>
                        )}
                      </button>
                    </div>

                    {/* XMind Messages */}
                    {xmindError && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-400 text-sm">
                        {xmindError}
                      </div>
                    )}

                    {xmindSuccess && (
                      <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4 text-green-400 text-sm">
                        {xmindSuccess}
                      </div>
                    )}
                  </div>
                </GlassCard>
              )}
            </div>
          )}

          {activeTab === 'xmind' && (
            <div className="max-w-4xl mx-auto">
              <XMindConverter />
            </div>
          )}
        </Container>
      </main>

      {/* Toast */}
      <Toast
        message="Ready! Here's your AI-generated guidance."
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />
    </div>
  );
}

export default App;
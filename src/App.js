import React, { useState, useEffect, useCallback } from 'react';
import { Copy, Download, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
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

  // Sample chips for autofill
  const samples = [
    "Write coverage wording for D&O Side A with SIR.",
    "Compare EPL vs. Fiduciary coverage triggers.",
    "Draft exclusions for cyber incidents with carve-outs."
  ];

  const handleCopyResponse = async () => {
    try {
      await navigator.clipboard.writeText(response);
      // setCopySuccess(true);
      // setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = response;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      // setCopySuccess(true);
      // setTimeout(() => setCopySuccess(false), 2000);
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
    setInsuranceSpec(sample);
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
    if (!insuranceSpec.trim()) {
      setError('Please enter insurance specifications');
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
      {/* Animated gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_0%,rgba(122,124,246,0.15),transparent_60%)]" />
      <div className="absolute inset-0 -z-10 animate-gradient-slow bg-[conic-gradient(at_20%_10%,#0f1020, #1b1f3a, #0f1020)]" />
      
      <main className="relative z-10">
        <Container>
          {/* Header */}
          <header className="mb-10 text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-white">
              Polycraft <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-secondary">Assistant</span>
            </h1>
            <p className="mt-3 text-base md:text-lg text-text-muted">
              AI-powered tools for insurance specifications and mind mapping.
            </p>
          </header>

          {/* Segmented Tabs */}
          <div className="mb-8 flex justify-center">
            <SegmentedTabs activeTab={activeTab} onTabChange={setActiveTab} />
          </div>

          {/* Tab Content */}
          {activeTab === 'insurance' && (
            <div className="lg:grid lg:grid-cols-2 gap-8">
              {/* Input Card */}
              <GlassCard>
                <div className="space-y-6">
                  <div>
                    <label htmlFor="specs" className="text-sm font-medium text-text-muted">
                      Insurance Specifications
                    </label>
                    <textarea
                      id="specs"
                      value={insuranceSpec}
                      onChange={(e) => setInsuranceSpec(e.target.value)}
                      placeholder="Describe your insurance needs, coverage requirements, or ask questions about insurance policies..."
                      className="mt-2 h-56 w-full resize-y rounded-xl bg-white/5 border border-white/10 px-4 py-3 text-[15px] text-white placeholder:text-[#8f95b2] focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-0 transition-all duration-200"
                      maxLength={2000}
                    />
                    <div className="mt-2 text-right text-xs text-[#8f95b2]">
                      {insuranceSpec.length}/2000
                    </div>
                  </div>

                  {/* Sample Chips */}
                  <div>
                    <p className="text-sm font-medium text-text-muted mb-3">Quick samples:</p>
                    <div className="flex flex-wrap gap-2">
                      {samples.map((sample, index) => (
                        <button
                          key={index}
                          onClick={() => handleSampleClick(sample)}
                          className="rounded-full px-3 py-1.5 bg-white/8 hover:bg-white/12 text-xs text-white transition-all duration-200 hover:scale-105 active:scale-95"
                        >
                          {sample}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    onClick={handleSubmit}
                    disabled={loading || !insuranceSpec.trim()}
                    loading={loading}
                    className="w-full h-12"
                  >
                    {loading ? (
                      <>
                        <Spinner className="mr-2 h-4 w-4" />
                        Talking to Bedrock…
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Get AI Response
                      </>
                    )}
                  </Button>

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
                    <span className="text-sm text-text-muted">Response Preview</span>
                    {response && (
                      <div className="flex gap-2">
                        <IconButton title="Copy" onClick={handleCopyResponse}>
                          <Copy className="w-4 h-4" />
                        </IconButton>
                        <IconButton title="Download" onClick={handleDownloadResponse}>
                          <Download className="w-4 h-4" />
                        </IconButton>
                      </div>
                    )}
                  </div>

                  <div className="min-h-[200px]">
                    {loading ? (
                      <div className="space-y-3">
                        <div className="h-4 bg-white/10 rounded animate-pulse"></div>
                        <div className="h-4 bg-white/10 rounded animate-pulse w-3/4"></div>
                        <div className="h-4 bg-white/10 rounded animate-pulse w-1/2"></div>
                        <div className="h-4 bg-white/10 rounded animate-pulse w-5/6"></div>
                      </div>
                    ) : response ? (
                      <pre className="whitespace-pre-wrap text-[15px] leading-7 text-white/95 font-sans">
                        {response}
                      </pre>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-text-muted">
                        <div className="text-center">
                          <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Your AI response will appear here</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </GlassCard>
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
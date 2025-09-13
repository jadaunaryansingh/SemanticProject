import { useState } from "react";
import { PerplexityResponse } from "@shared/api";

const features = [
  { badge: "AI-Powered", title: "Perplexity Integration", desc: "Advanced AI responses using Perplexity's latest models with real-time web search." },
  { badge: "Generation", title: "Smart Answers", desc: "Context-aware responses with citations and sources from Perplexity AI." },
  { badge: "Pipelines", title: "PDF Processing", desc: "Upload and analyze PDF documents directly with Perplexity AI integration." },
  { badge: "Real-time", title: "Live Search", desc: "Get up-to-date information with Perplexity's web search capabilities." },
];

export default function Index() {
  const [query, setQuery] = useState("");
  const [doc, setDoc] = useState<string>(examplePolicy);
  const [parsing, setParsing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<PerplexityResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onPdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setParsing(true);
    setProgress(0);
    setError(null);
    
    try {
      const text = await extractTextFromPdf(file, (p) => setProgress(p));
      setDoc(text);
    } catch (err) {
      console.error(err);
      setError('Failed to process PDF');
    } finally {
      setParsing(false);
    }
  };

  async function extractTextFromPdf(file: File, onProgress?: (p: number) => void) {
    const formData = new FormData();
    formData.append('pdf', file);
    
    // Simulate progress
    if (onProgress) onProgress(25);
    
    const response = await fetch('/api/pdf/upload', {
      method: 'POST',
      body: formData
    });
    
    if (onProgress) onProgress(75);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to process PDF');
    }
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.error || 'PDF processing failed');
    }
    
    if (onProgress) onProgress(100);
    
    return normalizeWhitespace(result.text);
  }

  function normalizeWhitespace(s: string) {
    return s.replace(/\s+/g, " ").trim();
  }

  const handleQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      console.log('Sending query:', { query: query.trim(), pdfContentLength: doc?.length || 0 });
      
      const response = await fetch('/api/perplexity/query-with-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: query.trim(),
          pdfContent: doc || ''
        }),
      });
      
      const result = await response.json();
      
      if (response.ok) {
        setResponse(result);
      } else {
        console.error('API Error:', result);
        setError(result.error || result.message || 'Failed to get response from Perplexity');
      }
    } catch (err) {
      console.error('Network Error:', err);
      setError('Failed to query Perplexity API - check your connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <section className="overflow-hidden border-b bg-[radial-gradient(1200px_600px_at_75%_-20%,hsl(var(--accent)/0.25),transparent),radial-gradient(800px_400px_at_-10%_10%,hsl(var(--primary)/0.25),transparent)]">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-primary"></span>
              AI-Powered • Perplexity API • PDF Processing • Real-time Search
            </div>
            <h1 className="mt-5 text-4xl md:text-6xl font-extrabold tracking-tight">
              AI-Powered Document Analysis with Perplexity
            </h1>
            <p className="mt-6 text-base md:text-lg text-muted-foreground">
              Upload PDF documents and ask questions using Perplexity's advanced AI models. Get intelligent responses with real-time web search and accurate citations.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <a href="#get-started" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-opacity hover:opacity-90">Get started</a>
              <a href="#api" className="inline-flex items-center justify-center rounded-md border px-6 py-3 text-sm font-semibold hover:bg-secondary">API example</a>
            </div>
          </div>
        </div>
      </section>

      <section id="get-started" className="container mx-auto px-4 py-14 md:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">Try it instantly</h2>
            <p className="text-muted-foreground">Upload a PDF document and ask questions. Perplexity AI will analyze the content and provide intelligent answers with citations and sources.</p>
            <div className="flex flex-wrap items-center gap-3">
              <input id="pdf-input" type="file" accept="application/pdf" onChange={onPdfChange} className="hidden" />
              <label htmlFor="pdf-input" className="inline-flex cursor-pointer items-center rounded-md border px-4 py-2 text-sm font-medium hover:bg-secondary">
                Upload PDF
              </label>
              {parsing ? (
                <span className="text-xs text-muted-foreground">Processing PDF…</span>
              ) : null}
            </div>
            <textarea
              aria-label="Document content"
              value={doc}
              onChange={(e) => setDoc(e.target.value)}
              placeholder="Paste document text here or upload a PDF above..."
              className="h-56 w-full resize-y rounded-md border bg-white/60 p-4 font-mono text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-3">
              <input
                aria-label="Question"
                placeholder="Ask a question about the document…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuery()}
                className="flex-1 rounded-md border bg-white/60 px-4 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
              <button 
                onClick={handleQuery}
                disabled={loading || !query.trim()}
                className="rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Asking..." : "Ask AI"}
              </button>
            </div>
            
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 shadow-sm">
                <h3 className="font-semibold text-red-800">Error</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
              </div>
            )}
            
            {response && (
              <div className="rounded-lg border bg-white/60 p-4 shadow-sm">
                <h3 className="font-semibold">AI Response</h3>
                <div className="mt-3 space-y-3">
                  <p className="text-sm">{response.answer}</p>
                  {response.sources && response.sources.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-muted-foreground mb-2">Sources:</h4>
                      <ul className="space-y-1">
                        {response.sources.map((source, index) => (
                          <li key={index} className="text-xs text-blue-600 hover:underline">
                            <a href={source} target="_blank" rel="noopener noreferrer">
                              {source}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="space-y-6" id="features">
            <h2 className="text-2xl md:text-3xl font-bold">What you get</h2>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((f) => (
                <li key={f.title} className="rounded-lg border bg-white/60 p-4 shadow-sm">
                  <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-secondary px-3 py-1 text-xs font-medium">
                    {f.badge}
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                </li>
              ))}
            </ul>

            <div id="architecture" className="rounded-xl border bg-white/60 p-6 shadow-sm">
              <h3 className="text-xl font-semibold">How it works</h3>
              <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-muted-foreground">
                <li>Upload PDF → extract text content using PDF.co API</li>
                <li>Send document content + question to Perplexity API</li>
                <li>Perplexity AI analyzes content with real-time web search</li>
                <li>Generate intelligent response with citations and sources</li>
                <li>Return formatted answer with clickable source links</li>
              </ol>
            </div>
          </div>
        </div>
      </section>

      <section id="api" className="border-t bg-secondary/40">
        <div className="container mx-auto px-4 py-14 md:py-20">
          <h2 className="text-2xl md:text-3xl font-bold">API example</h2>
          <div className="mt-4 overflow-hidden rounded-xl border bg-white/70 shadow-sm">
            <div className="border-b bg-secondary/50 px-4 py-2 text-xs font-medium text-muted-foreground">POST /api/perplexity/query-with-pdf</div>
            <pre className="overflow-x-auto p-4 text-sm"><code>{apiExample}</code></pre>
          </div>
        </div>
      </section>
    </div>
  );
}

const apiExample = `{
  "query": "What is the reimbursement policy for travel?",
  "pdfContent": "Company Travel Policy\\nEmployees traveling for business must adhere to the following rules..."
}`;

const examplePolicy = `Company Travel Policy
Employees traveling for business must adhere to the following rules. The company will reimburse economy flights for trips under 6 hours and premium economy for longer flights with prior approval. Hotels should be mid-range business class; luxury accommodations require VP approval. Meals are reimbursed up to $75 per day. Local transportation such as metro, bus, or standard rideshare is reimbursable. Personal expenses are not reimbursable. All receipts must be submitted within 14 days of travel completion. For international trips, ensure you have necessary visas and vaccinations. For emergencies, contact the travel desk available 24/7.`;

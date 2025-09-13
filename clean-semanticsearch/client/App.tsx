import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen flex flex-col">
          <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-background/70">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2 font-extrabold text-lg">
                <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-400 bg-clip-text text-transparent">PolicyQA</span>
              </a>
              <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
                <a className="hover:text-foreground transition-colors" href="#features">Features</a>
                <a className="hover:text-foreground transition-colors" href="#architecture">Architecture</a>
                <a className="hover:text-foreground transition-colors" href="#api">API</a>
              </nav>
              <div className="flex items-center gap-2">
                <a href="#get-started" className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Get started</a>
              </div>
            </div>
          </header>

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Index />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>

          <footer className="border-t bg-white/60 dark:bg-background/70">
            <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
              <p>© {new Date().getFullYear()} PolicyQA by Aryan Singh Jadaun</p>
              <div className="flex items-center gap-4">
                <a href="#privacy" className="hover:text-foreground">Privacy</a>
                <a href="#terms" className="hover:text-foreground">Terms</a>
              </div>
            </div>
          </footer>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);

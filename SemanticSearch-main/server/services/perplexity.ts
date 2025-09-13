import { PerplexityRequest, PerplexityResponse, PerplexityError } from "@shared/api";

const PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions";

export class PerplexityService {
  private getApiKey(): string {
    const apiKey = process.env.PERPLEXITY_API_KEY ?? "";
    if (!apiKey) {
      console.error('ERROR: PERPLEXITY_API_KEY environment variable is not set');
      throw new Error('Missing PERPLEXITY_API_KEY environment variable. Please set your Perplexity API key in the environment variables.');
    }
    return apiKey;
  }

  async query(request: PerplexityRequest): Promise<PerplexityResponse> {
    try {
      const { query, pdfContent, model = "sonar-pro" } = request;

      // Prepare the messages array
      const messages = [];
      
      if (pdfContent) {
        // If PDF content is provided, include it in the context
        messages.push({
          role: "system",
          content: `You are a helpful assistant that can analyze PDF documents and answer questions about them. Use the provided PDF content to answer questions accurately and cite relevant sections when possible.`
        });
        messages.push({
          role: "user",
          content: `PDF Content:\n${pdfContent}\n\nQuestion: ${query}`
        });
      } else {
        messages.push({
          role: "user",
          content: query
        });
      }

      const response = await fetch(PERPLEXITY_API_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.getApiKey()}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages,
          max_tokens: 1000,
          temperature: 0.2,
          top_p: 0.9,
          return_citations: true,
          search_domain_filter: ["perplexity.ai"],
          search_recency_filter: "month"
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Perplexity API error: ${response.status} - ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      
      // Extract the response content
      const answer = data.choices?.[0]?.message?.content || "No response generated";
      
      // Extract citations if available
      const citations = data.citations || [];
      
      return {
        answer,
        sources: citations,
        citations: citations
      };

    } catch (error) {
      console.error("Perplexity API error:", error);
      throw new Error(`Failed to query Perplexity: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async queryWithPDF(pdfContent: string, query: string): Promise<PerplexityResponse> {
    return this.query({
      query,
      pdfContent,
      model: "sonar-pro"
    });
  }
}

// Export a singleton instance
export const perplexityService = new PerplexityService();

import { PDFProcessResponse } from "@shared/api";

export class PDFProcessor {
  private getApiKey(): string {
    const apiKey = process.env.PDF_CO_API_KEY ?? "";
    if (!apiKey) {
      throw new Error('Missing PDF_CO_API_KEY environment variable');
    }
    return apiKey;
  }
  private readonly PDF_CO_PRESIGNED_URL = "https://api.pdf.co/v1/file/upload/get-presigned-url";
  private readonly PDF_CO_EXTRACT_URL = "https://api.pdf.co/v1/pdf/convert/to/text";

  async processPDF(file: File): Promise<PDFProcessResponse> {
    try {
      // Ensure API key is present
      this.getApiKey();
      // Step 1: Get pre-signed URL for upload
      const presignedData = await this.getPresignedUrl(file.name);
      
      // Step 2: Upload file to pre-signed URL
      await this.uploadFileToPresignedUrl(presignedData.presignedUrl, file);
      
      // Step 3: Extract text using the file URL
      const extractedText = await this.extractTextFromUrl(presignedData.url);
      
      return {
        text: extractedText,
        success: true
      };
      
    } catch (error) {
      console.error("PDF processing error:", error);
      return {
        text: "",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error processing PDF"
      };
    }
  }

  private async getPresignedUrl(fileName: string): Promise<{ presignedUrl: string; url: string }> {
    const url = `${this.PDF_CO_PRESIGNED_URL}?name=${encodeURIComponent(fileName)}&contenttype=${encodeURIComponent('application/pdf')}`;

    let response: Response;
    try {
      response = await fetch(url, {
        method: 'GET',
        headers: {
          'x-api-key': this.getApiKey(),
          'Accept': 'application/json',
          'User-Agent': 'fusion-starter/1.0 (+https://github.com/)'
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown network error';
      throw new Error(`PDF.co presigned URL network error: ${message}`);
    }

    // Safely parse JSON; some errors may return non-JSON bodies
    const safeJson = async () => {
      try { return await response.json(); } catch { return null as any; }
    };
    const safeText = async () => {
      try { return await response.text(); } catch { return ''; }
    };

    if (!response.ok) {
      const errorData = await safeJson();
      const fallbackText = errorData ? '' : await safeText();
      const message = errorData?.message || errorData?.error || fallbackText || 'Unknown error';
      console.error('PDF.co presigned URL failed', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        bodyPreview: (fallbackText || '').slice(0, 500)
      });
      throw new Error(`PDF.co presigned URL error: ${response.status} ${response.statusText} ${message}`.trim());
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const bodyText = await safeText();
      const preview = (bodyText || '').slice(0, 200).replace(/\s+/g, ' ').trim();
      console.error('PDF.co presigned URL non-JSON response', {
        status: response.status,
        statusText: response.statusText,
        contentType,
        bodyPreview: (bodyText || '').slice(0, 500)
      });
      throw new Error(`Failed to get presigned URL: ${response.status} ${response.statusText} content-type=${contentType} body=${preview}`);
    }

    const result = await safeJson();
    const hasFields = result && typeof result === 'object' && 'presignedUrl' in result && 'url' in result;
    if (!hasFields) {
      const fallbackText = result ? '' : await safeText();
      const message = result?.message || result?.error || fallbackText || 'Unknown error';
      const statusPart = `${response.status} ${response.statusText}`;
      console.error('PDF.co presigned URL unexpected payload', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        bodyPreview: (fallbackText || JSON.stringify(result)).slice(0, 500)
      });
      throw new Error(`Failed to get presigned URL: ${statusPart} ${message}`.trim());
    }

    return {
      presignedUrl: String(result.presignedUrl),
      url: String(result.url)
    };
  }

  private async uploadFileToPresignedUrl(presignedUrl: string, file: File): Promise<void> {
    const contentType = file.type || 'application/pdf';
    const response = await fetch(presignedUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': contentType
      },
      body: file
    });

    if (!response.ok) {
      const text = await (async () => { try { return await response.text(); } catch { return ''; } })();
      const preview = (text || '').slice(0, 300).replace(/\s+/g, ' ').trim();
      console.error('Presigned upload failed', { status: response.status, statusText: response.statusText, contentType, bodyPreview: preview });
      throw new Error(`File upload to presigned URL failed: ${response.status} ${response.statusText}`);
    }
  }

  private async extractTextFromUrl(fileUrl: string): Promise<string> {
    const response = await fetch(this.PDF_CO_EXTRACT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'fusion-starter/1.0 (+https://github.com/)',
        'x-api-key': this.getApiKey()
      },
      body: JSON.stringify({
        url: fileUrl,
        inline: true
      })
    });

    if (!response.ok) {
      const ct = response.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const errorData = await response.json();
        throw new Error(`PDF.co extraction error: ${errorData.message || response.statusText}`);
      }
      const t = await response.text();
      console.error('PDF.co extract non-JSON error', {
        status: response.status,
        statusText: response.statusText,
        contentType: ct,
        bodyPreview: t.slice(0, 500)
      });
      throw new Error(`PDF.co extraction error: ${response.status} ${response.statusText}`);
    }

    const ctOk = response.headers.get('content-type') || '';
    if (!ctOk.includes('application/json')) {
      const t = await response.text();
      console.error('PDF.co extract non-JSON success payload', {
        contentType: ctOk,
        bodyPreview: t.slice(0, 500)
      });
      throw new Error('PDF.co extraction unexpected content type');
    }
    const result = await response.json();

    // Some PDF.co responses include body even when success is false/missing
    if (result && typeof result.body === 'string' && result.body.trim().length > 0) {
      return this.cleanText(result.body);
    }

    if (!result.success) {
      const details = result.message || result.error || JSON.stringify(result).slice(0, 300);
      console.error('PDF.co extract returned failure', { resultPreview: JSON.stringify(result).slice(0, 500) });
      throw new Error(`Text extraction failed: ${details}`);
    }

    return this.cleanText(result.body || '');
  }

  private cleanText(text: string): string {
    return text
      .replace(/\s+/g, " ") // Replace multiple whitespace with single space
      .replace(/\n\s*\n/g, "\n") // Replace multiple newlines with single newline
      .trim();
  }

  async extractTextFromBuffer(buffer: ArrayBuffer, filename: string = 'document.pdf'): Promise<string> {
    this.getApiKey();
    // Step 1: Get pre-signed URL for upload
    const presignedData = await this.getPresignedUrl(filename);
    
    // Step 2: Convert buffer to File and upload to pre-signed URL
    const file = new File([buffer], filename, { type: 'application/pdf' });
    await this.uploadFileToPresignedUrl(presignedData.presignedUrl, file);
    
    // Step 3: Extract text using the file URL
    return await this.extractTextFromUrl(presignedData.url);
  }
}

// Export a singleton instance
export const pdfProcessor = new PDFProcessor();

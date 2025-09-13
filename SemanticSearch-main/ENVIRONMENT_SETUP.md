# Environment Setup Guide

## Required Environment Variables

To fix the 400 error you're experiencing, you need to set up the required environment variables.

### 1. Create a .env file

Create a `.env` file in the root directory of your project with the following content:

```bash
# Perplexity API Configuration
# Get your API key from: https://www.perplexity.ai/settings/api
PERPLEXITY_API_KEY=pplx-your-api-key-here

# PDF Processing API (if using pdf.co service)
# Get your API key from: https://pdf.co/
PDF_CO_API_KEY=your-pdf-co-api-key-here

# Application Configuration
PING_MESSAGE=pong
NODE_ENV=development
```

### 2. Get Your Perplexity API Key

1. Go to [Perplexity AI Settings](https://www.perplexity.ai/settings/api)
2. Sign in to your account
3. Generate a new API key
4. Copy the API key and replace `pplx-your-api-key-here` in your `.env` file

### 3. Restart the Development Server

After creating the `.env` file with your API key:

```bash
npm run dev
```

### 4. For Netlify Deployment

When deploying to Netlify, add the environment variables in your Netlify dashboard:

1. Go to your site settings in Netlify
2. Navigate to "Environment variables"
3. Add `PERPLEXITY_API_KEY` with your actual API key value
4. Redeploy your site

## Error Explanation

The 400 error you're seeing is caused by the missing `PERPLEXITY_API_KEY` environment variable. The application cannot make API calls to Perplexity without this key, so it returns a 400 error with a clear message about the missing configuration.

Once you set up the environment variables correctly, the API should work as expected.

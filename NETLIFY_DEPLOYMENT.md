# Netlify Deployment Guide

## Prerequisites
- Netlify account
- GitHub repository (recommended for automatic deployments)

## Environment Variables Setup

You need to configure the following environment variables in your Netlify dashboard:

### Required Environment Variables:
1. `VITE_GOOGLE_API_KEY` = `your_google_api_key_here`
2. `VITE_GOOGLE_CLIENT_ID` = `your_google_client_id_here`
3. `VITE_GOOGLE_SHEETS_ID` = `your_google_sheets_id_here`
4. `VITE_APP_NAME` = `Student Management System`
5. `VITE_APP_VERSION` = `1.0.0`
6. `VITE_POLLING_INTERVAL` = `30000`
7. `VITE_MAX_RETRIES` = `3`

> **⚠️ SECURITY WARNING**: Never commit your actual API keys to version control. Use placeholders in documentation and set the real values only in Netlify's environment variables dashboard.

### How to Set Environment Variables in Netlify:

#### Method 1: Netlify Dashboard
1. Go to your Netlify dashboard
2. Select your site
3. Go to **Site settings** > **Environment variables**
4. Click **Add a variable**
5. Add each environment variable one by one

#### Method 2: Using Netlify CLI
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Set environment variables (replace with your actual values)
netlify env:set VITE_GOOGLE_API_KEY "your_google_api_key_here"
netlify env:set VITE_GOOGLE_CLIENT_ID "your_google_client_id_here"
netlify env:set VITE_GOOGLE_SHEETS_ID "your_google_sheets_id_here"
netlify env:set VITE_APP_NAME "Student Management System"
netlify env:set VITE_APP_VERSION "1.0.0"
netlify env:set VITE_POLLING_INTERVAL "30000"
netlify env:set VITE_MAX_RETRIES "3"
```

## Deployment Steps

### Option 1: Git-based Deployment (Recommended)
1. Push your code to GitHub
2. Connect your GitHub repository to Netlify
3. Set build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`
   - **Node version**: `20.x`
4. Add environment variables (see above)
5. Deploy

### Option 2: Manual Deployment
1. Build your project locally:
   ```bash
   npm run build
   ```
2. Drag and drop the `dist` folder to Netlify's deploy interface

## Build Configuration

The project includes a `netlify.toml` file with the following configuration:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: `20.x`
- Redirects for React Router

## Troubleshooting

### Common Issues:
1. **Environment variables not loaded**: Make sure all variables are set in Netlify dashboard
2. **Build fails**: Check that Node version is set to 20.x
3. **Routes not working**: The `netlify.toml` includes redirects for React Router
4. **Google Sheets access**: Ensure your Google API key and OAuth client are configured for your domain

### Testing Environment Variables:
You can add a temporary debug component to check if environment variables are loaded:
```typescript
console.log('Environment variables:', {
  apiKey: import.meta.env.VITE_GOOGLE_API_KEY ? 'Set' : 'Missing',
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID ? 'Set' : 'Missing',
  sheetsId: import.meta.env.VITE_GOOGLE_SHEETS_ID ? 'Set' : 'Missing'
});
```

## Security Notes
- Never commit `.env` files to your repository
- Environment variables in Netlify are secure and not exposed to the client
- Vite variables prefixed with `VITE_` are exposed to the client-side code

## Security Best Practices

### ⚠️ IMPORTANT SECURITY NOTES:
1. **Never commit sensitive data**: Your `.env` file is already in `.gitignore` - keep it that way!
2. **Use Netlify's secure environment variables**: Set your real API keys only in Netlify's dashboard
3. **Rotate your keys regularly**: Consider regenerating API keys periodically
4. **Domain restrictions**: Configure your Google API key to only work with your deployed domain
5. **OAuth settings**: Update your Google OAuth client to include your Netlify domain

### What to Keep Private:
- Google API Key
- Google Client ID
- Google Sheets ID
- Any database connection strings
- Authentication secrets

### What's Safe to Share:
- App name and version
- Polling intervals and retry counts
- Build configuration
- General project structure

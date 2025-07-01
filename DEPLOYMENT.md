# Netlify deployment instructions for Student Management App

## Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Google Cloud Console project with Sheets API enabled
- Google OAuth 2.0 credentials

## Deployment Steps

### 1. Build the project locally (optional, for testing)
```bash
npm install
npm run build
```

### 2. Deploy to Netlify

#### Option A: Drag and Drop (Quick deployment)
1. Run `npm run build` locally
2. Go to [Netlify](https://app.netlify.com/)
3. Drag and drop the `dist` folder to deploy

#### Option B: Git-based deployment (Recommended)
1. Push your code to GitHub/GitLab/Bitbucket
2. Connect your repository to Netlify
3. Netlify will automatically build and deploy

### 3. Configure Environment Variables
In your Netlify dashboard, go to Site settings > Environment variables and add:

```
VITE_GOOGLE_API_KEY=your_google_api_key
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_SHEETS_ID=your_google_sheets_id
VITE_APP_NAME=Student Management System
VITE_APP_VERSION=1.0.0
VITE_POLLING_INTERVAL=30000
VITE_MAX_RETRIES=3
```

**⚠️ Important:** Never commit your `.env` file to version control. The environment variables should be set in Netlify's dashboard.

### 4. Update Google OAuth Settings
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to APIs & Services > Credentials
3. Edit your OAuth 2.0 client
4. Add your Netlify domain to "Authorized JavaScript origins":
   - `https://your-app-name.netlify.app`
   - `https://your-custom-domain.com` (if using custom domain)

### 5. Verify Deployment
- Check that the app loads correctly
- Test Google OAuth login
- Verify that data loads from Google Sheets
- Test all CRUD operations

## Build Configuration
The project uses Vite as the build tool with the following configuration:
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18

## Security Considerations
- All sensitive credentials are stored as environment variables
- Google OAuth is configured with proper origin restrictions
- Security headers are configured in `netlify.toml`
- API keys are never exposed in the client code

## Troubleshooting
- If OAuth fails, check that your Netlify domain is added to Google OAuth origins
- If build fails, ensure all environment variables are set correctly
- Check Netlify function logs for any server-side errors
- Verify that Google Sheets API is enabled and has proper permissions

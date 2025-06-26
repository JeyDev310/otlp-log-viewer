# OTLP Log Viewer

A modern web application for viewing and analyzing OpenTelemetry Protocol (OTLP) logs. This application fetches log data from an OTLP endpoint, displays logs in a detailed table with expandable rows, and visualizes log distribution over time with a histogram.

![OTLP Log Viewer Screenshot](https://via.placeholder.com/800x450.png?text=OTLP+Log+Viewer)

## Features
- **Fetch the list of log records**: Retrieve the list of log records from the OTLP logs HTTP endpoint mentioned above (at runtime).
- **Log Table Display**: View logs with severity, timestamp, and message body in a clean table format
- **Expandable Log Details**: Click on any log row to view detailed attributes including:
  - Log attributes
  - Resource attributes
  - Scope attributes
  - Trace ID and Span ID
- **Time-based Histogram**: Visualize log distribution over time
- **Severity Filtering**: Visual indicators for different log severity levels
- **Responsive Design**: Works on desktop and mobile devices
- **Error Handling**: Graceful error display with retry functionality
- **Loading States**: Visual feedback during data loading

## Technology Stack

- **Frontend**: React with TypeScript
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS
- **Data Visualization**: Recharts
- **HTTP Client**: Axios
- **Date Formatting**: date-fns
- **OTLP Types**: Custom TypeScript definitions based on OpenTelemetry Protocol

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/otlp-log-viewer.git
cd otlp-log-viewer

# Install dependencies
npm install
# or
yarn install
# or
pnpm install
```

### Running the Development Server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3001) with your browser to see the application.

## Project Structure

```
src/
├── app/                 # Next.js app router files
│   ├── page.tsx         # Main application page
│   └── layout.tsx       # Root layout component
├── components/          # React components
│   ├── ErrorDisplay.tsx # Error display component
│   ├── Header.tsx       # Application header
│   ├── LoadingSpinner.tsx # Loading indicator
│   ├── LogHistogram.tsx # Time-based log histogram
│   └── LogTable.tsx     # Log records table with expandable rows
├── services/            # API and data services
│   └── logService.ts    # Service for fetching and processing logs
└── types/               # TypeScript type definitions
    └── otlp.ts          # OTLP-specific type definitions
```

## API Integration

The application fetches log data from the following endpoint:

```
https://take-home-assignment-otlp-logs-api.vercel.app/api/logs
```

The response follows the OpenTelemetry Protocol (OTLP) format, which is parsed and transformed for display in the UI.

## Type Safety

The application uses TypeScript throughout with custom type definitions for OTLP data structures. This ensures type safety and better developer experience when working with the complex nested structure of OTLP logs.

## Deployment

### Deploying to Vercel

This application is optimized for deployment on Vercel, the platform created by the team behind Next.js.

#### Option 1: Deploy with Vercel CLI

1. Install the Vercel CLI if you haven't already:
   ```bash
   npm install -g vercel
   ```

2. Login to your Vercel account:
   ```bash
   vercel login
   ```

3. Deploy from your project directory:
   ```bash
   vercel
   ```

4. Follow the interactive prompts. For production deployment:
   ```bash
   vercel --prod
   ```

#### Option 2: Deploy via GitHub Integration

1. Push your code to a GitHub repository
2. Go to [Vercel Dashboard](https://vercel.com/dashboard)
3. Click "New Project"
4. Select your GitHub repository
5. Configure your project settings:
   - Framework Preset: Next.js
   - Build Command: `next build`
   - Output Directory: `.next`
6. Click "Deploy"

#### Environment Variables

No environment variables are required for basic deployment as the API endpoint is hardcoded. If you need to use a different API endpoint, you can set it as an environment variable in your Vercel project settings:

- `NEXT_PUBLIC_LOGS_API_URL`: Your custom OTLP logs API endpoint

### Custom Domain

To add a custom domain to your Vercel deployment:

1. Go to your project in the Vercel dashboard
2. Navigate to "Settings" > "Domains"
3. Add your domain and follow the verification steps

### Deployment Preview

Vercel automatically creates preview deployments for pull requests, allowing you to test changes before merging to your main branch.

### Alternative Deployment Options

You can also deploy this application to any platform that supports Next.js applications, such as:

- AWS Amplify
- Netlify
- DigitalOcean App Platform
- Self-hosted environments

## Future Enhancements

- Advanced filtering and search capabilities
- Log aggregation and analytics
- Dark mode support
- Pagination for large log datasets
- Export functionality (CSV, JSON)
- Real-time log streaming

## License

MIT


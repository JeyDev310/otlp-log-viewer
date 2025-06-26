import React from 'react';

const title = 'OTLP Log Viewer';
const subtitle = 'OpenTelemetry';

/**
 * Header Component
 * 
 * Displays the application title and subtitle in a responsive header bar
 * Provides consistent branding across the application
 * 
 * @returns {JSX.Element} Rendered header component
 */
export default function Header() {
  return (
    <header className="bg-white shadow">
      {/* Container with responsive padding */}
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center">
        {/* Main application title */}
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {/* Technology badge/pill */}
        <div className="ml-4 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-medium">
          {subtitle}
        </div>
      </div>
    </header>
  );
}

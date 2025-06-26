'use client'; // Enable client-side rendering for this component

// Import React hooks for state management and side effects
import { useState, useEffect } from 'react';
// Import the log fetching service
import { fetchLogs } from '@/services/logService';
// Import the LogEntry type definition
import { LogEntry } from '@/types/otlp';
// Import UI components
import LogTable from '@/components/LogTable';
import LogHistogram from '@/components/LogHistogram';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorDisplay from '@/components/ErrorDisplay';
import Header from '@/components/Header';

/**
 * Home component - Main page of the OTLP Log Viewer application
 * Responsible for fetching log data and managing application state
 */
export default function Home() {
  // State for storing the fetched log entries
  const [logs, setLogs] = useState<LogEntry[]>([]);
  // State for tracking loading status
  const [loading, setLoading] = useState(true);
  // State for storing any error messages
  const [error, setError] = useState<string | null>(null);

  /**
   * Asynchronously loads log data from the OTLP API
   * Manages loading and error states during the process
   */
  const loadLogs = async () => {
    try {
      // Set loading state to true and clear any previous errors
      setLoading(true);
      setError(null);
      // Fetch log data from the API
      const logData = await fetchLogs();
      // Update state with the fetched logs
      setLogs(logData);
    } catch (err) {
      // Log the error to console for debugging
      console.error('Failed to load logs:', err);
      // Set user-friendly error message
      setError('Failed to load logs. Please try again later.');
    } finally {
      // Set loading to false regardless of success or failure
      setLoading(false);
    }
  };

  // Effect hook to load logs when the component mounts
  useEffect(() => {
    loadLogs();
  }, []);

  // Render the UI for the OTLP Log Viewer application
  return (
    // Main container with full height and light background
    <div className="min-h-screen bg-gray-50">
      {/* Application header with title */}
      <Header />
      
      {/* Main content area with responsive padding */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Histogram section - Shows log distribution over time */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Log Distribution Over Time</h2>
            {/* Conditional rendering based on application state */}
            {loading ? (
              // Show loading spinner while data is being fetched
              <LoadingSpinner />
            ) : error ? (
              // Show error message with retry button if fetch failed
              <ErrorDisplay message={error} retry={loadLogs} />
            ) : (
              // Show histogram chart when data is available
              <LogHistogram logs={logs} />
            )}
          </div>

          {/* Log records table section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Table header with instructions */}
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-lg font-medium text-gray-900">Log Records</h2>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Click on a log record to view detailed attributes
              </p>
            </div>
            {/* Conditional rendering based on application state */}
            {loading ? (
              // Show loading spinner while data is being fetched
              <div className="p-6">
                <LoadingSpinner />
              </div>
            ) : error ? (
              // Show error message with retry button if fetch failed
              <div className="p-6">
                <ErrorDisplay message={error} retry={loadLogs} />
              </div>
            ) : logs.length === 0 ? (
              // Display message when no logs are found
              <div className="p-6 text-center text-gray-500">
                No logs found
              </div>
            ) : (
              // Show log table when data is available
              <LogTable logs={logs} />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

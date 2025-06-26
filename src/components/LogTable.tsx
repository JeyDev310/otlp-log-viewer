import React, { useState } from 'react';
import { format } from 'date-fns';
import { LogEntry, AttributeValue } from '@/types/otlp';
import { getSeverityText, getSeverityColor } from '@/services/logService';

/**
 * Props for the LogTable component
 */
interface LogTableProps {
  logs: LogEntry[];
}

/**
 * LogTable Component
 * Displays log records in a table format with expandable rows for detailed information
 * 
 * @param {LogTableProps} props - Component props containing log entries
 * @returns {JSX.Element} Rendered component
 */
export default function LogTable({ logs }: LogTableProps) {
  // Use index as a more reliable identifier for expansion state
  // This tracks which row is currently expanded (if any)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  /**
   * Toggles the expanded state of a log row
   * If the row is already expanded, it collapses it
   * If another row is expanded, it collapses that one and expands the clicked row
   * 
   * @param {number} index - The index of the log row to toggle
   */
  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  /**
   * Formats a timestamp from nanoseconds to a human-readable date string
   * 
   * @param {string | number | undefined} timeUnixNano - Timestamp in nanoseconds
   * @returns {string} Formatted date string or 'N/A' if timestamp is missing
   */
  const formatTimestamp = (timeUnixNano?: string | number) => {
    if (!timeUnixNano) return 'N/A';
    
    // Convert nanoseconds to milliseconds for JavaScript Date object
    const timeInMs = typeof timeUnixNano === 'string' 
      ? Number(timeUnixNano) / 1000000 
      : timeUnixNano / 1000000;
    
    const date = new Date(timeInMs);
    return format(date, 'yyyy-MM-dd HH:mm:ss.SSS');
  };

  /**
   * Extracts the message body from a log record
   * 
   * @param {string | undefined} body - Log body string
   * @returns {string} Message content or 'No message' if empty
   */
  const formatBody = (body?: string) => {
    return body || 'No message';
  };

  /**
   * Renders a grid of key-value pairs for log attributes
   * 
   * @param {Record<string, AttributeValue> | undefined} attributes - Object of key-value attributes
   * @returns {JSX.Element | null} Grid of attributes or null if no attributes
   */
  const renderAttributes = (attributes?: Record<string, AttributeValue>) => {
    if (!attributes || Object.keys(attributes).length === 0) return null;
    
    return (
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(attributes).map(([key, value], index) => {
          return (
            <React.Fragment key={`${key}-${index}`}>
              <div className="text-sm font-medium text-gray-700 truncate">{key}</div>
              <div className="text-sm text-gray-500 truncate">{String(value ?? 'null')}</div>
            </React.Fragment>
          );
        })}
      </div>
    );
  };

  // Render the log table with expandable rows
  return (
    <div className="overflow-x-auto shadow-md rounded-lg">
      {/* Main table for displaying logs */}
      <table className="min-w-full divide-y divide-gray-200">
        {/* Table header with column titles */}
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Severity
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Time
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Body
            </th>
          </tr>
        </thead>
        {/* Table body containing log entries */}
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Map through each log entry and render a row */}
          {logs.map((log, index) => {
            // Check if this row is currently expanded
            const isExpanded = expandedIndex === index;
            // Generate a unique ID for this log entry
            const uniqueId = log.traceId || `log-${log.timeUnixNano}-${index}`;
            
            return (
              <React.Fragment key={uniqueId}>
                {/* Main log row - clickable to expand/collapse */}
                <tr 
                  className={`${isExpanded ? 'bg-gray-50' : 'hover:bg-gray-50'} cursor-pointer`}
                  onClick={() => toggleExpand(index)}
                >
                  {/* Severity cell with color-coded badge */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getSeverityColor(log.severityNumber)}`}>
                      {getSeverityText(log.severityNumber)}
                    </span>
                  </td>
                  {/* Timestamp cell */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatTimestamp(log.timeUnixNano)}
                  </td>
                  {/* Message body cell */}
                  <td className="px-6 py-4 text-sm text-gray-900 truncate max-w-md">
                    {formatBody(log.body)}
                  </td>
                </tr>
                {/* Expanded details row - only shown when row is expanded */}
                {isExpanded && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 bg-gray-50">
                      <div className="space-y-4">
                        {/* Log Attributes section */}
                        {log.attributes && Object.keys(log.attributes).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Log Attributes</h4>
                            {renderAttributes(log.attributes)}
                          </div>
                        )}
                        
                        {/* Resource Attributes section */}
                        {log.resourceAttributes && Object.keys(log.resourceAttributes).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Resource Attributes</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(log.resourceAttributes).map(([key, value], i) => (
                                <React.Fragment key={i}>
                                  <div className="font-medium text-gray-700">{key}</div>
                                  <div className="text-gray-900 font-mono text-sm">{String(value)}</div>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Scope Attributes section */}
                        {log.scopeAttributes && Object.keys(log.scopeAttributes).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Scope Attributes</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {Object.entries(log.scopeAttributes).map(([key, value], i) => (
                                <React.Fragment key={i}>
                                  <div className="font-medium text-gray-700">{key}</div>
                                  <div className="text-gray-900 font-mono text-sm">{String(value)}</div>
                                </React.Fragment>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Trace and Span IDs section - for distributed tracing context */}
                        <div className="grid grid-cols-2 gap-2">
                          {log.traceId && (
                            <>
                              <div className="font-medium text-gray-700">Trace ID</div>
                              <div className="text-gray-900 font-mono text-sm">{log.traceId}</div>
                            </>
                          )}
                          {log.spanId && (
                            <>
                              <div className="font-medium text-gray-700">Span ID</div>
                              <div className="text-gray-900 font-mono text-sm">{log.spanId}</div>
                            </>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

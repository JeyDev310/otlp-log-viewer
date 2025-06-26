import axios from 'axios';
import { 
  IExportLogsServiceRequest, 
  LogEntry, 
  AttributeValue, 
  extractAnyValue,
  extractStringValue
} from '@/types/otlp';

/**
 * API endpoint for fetching OTLP logs
 * Uses environment variable if available, otherwise falls back to default URL
 */
const LOGS_API_URL = process.env.NEXT_PUBLIC_LOGS_API_URL || 'https://take-home-assignment-otlp-logs-api.vercel.app/api/logs';

/**
 * Fetches and processes OTLP logs from the API endpoint
 * Transforms the nested OTLP structure into a flattened array of log entries
 * with associated resource and scope attributes
 * 
 * @returns {Promise<LogEntry[]>} Promise resolving to an array of processed log entries
 */
export async function fetchLogs(): Promise<LogEntry[]> {
  try {
    // Fetch raw OTLP data from API
    const response = await axios.get<IExportLogsServiceRequest>(LOGS_API_URL);
    const data = response.data;
    const logRecords: LogEntry[] = [];

    // Process resourceLogs - the top level of the OTLP logs hierarchy
    if (data.resourceLogs && Array.isArray(data.resourceLogs)) {
      data.resourceLogs.forEach(resourceLog => {
        // Extract resource attributes (metadata about the source of the logs)
        const resourceAttributes: Record<string, AttributeValue> = {};
        if (resourceLog.resource?.attributes && Array.isArray(resourceLog.resource.attributes)) {
          resourceLog.resource.attributes.forEach(attr => {
            if (attr.key) {
              // Extract the value using our helper function
              resourceAttributes[attr.key] = extractAnyValue(attr.value);
            }
          });
        }

        // Process scopeLogs - logs grouped by instrumentation scope
        if (resourceLog.scopeLogs && Array.isArray(resourceLog.scopeLogs)) {
          resourceLog.scopeLogs.forEach(scopeLog => {
            // Extract scope attributes (metadata about the instrumentation library)
            const scopeAttributes: Record<string, AttributeValue> = {};
            if (scopeLog.scope?.attributes && Array.isArray(scopeLog.scope.attributes)) {
              scopeLog.scope.attributes.forEach(attr => {
                if (attr.key) {
                  // Extract the value using our helper function
                  scopeAttributes[attr.key] = extractAnyValue(attr.value);
                }
              });
            }

            // Add scope name and version to attributes for better context
            if (scopeLog.scope?.name) {
              scopeAttributes['scope.name'] = scopeLog.scope.name;
            }
            if (scopeLog.scope?.version) {
              scopeAttributes['scope.version'] = scopeLog.scope.version;
            }

            // Process individual log records within this scope
            if (scopeLog.logRecords && Array.isArray(scopeLog.logRecords)) {
              scopeLog.logRecords.forEach(logRecord => {
                // Create a flattened log entry with all context (resource and scope)
                // Convert the OTLP LogRecord to our application's LogEntry format
                const logEntry: LogEntry = {
                  // Convert Fixed64 to string for compatibility
                  timeUnixNano: logRecord.timeUnixNano.toString(),
                  severityNumber: logRecord.severityNumber,
                  severityText: logRecord.severityText,
                  // Extract string value from IAnyValue body
                  body: extractStringValue(logRecord.body),
                  // Convert attributes to our format
                  attributes: {},
                  droppedAttributesCount: logRecord.droppedAttributesCount,
                  // Convert trace and span IDs to string if they're Uint8Array
                  traceId: typeof logRecord.traceId === 'string' ? logRecord.traceId : 
                          logRecord.traceId ? Buffer.from(logRecord.traceId).toString('hex') : undefined,
                  spanId: typeof logRecord.spanId === 'string' ? logRecord.spanId : 
                         logRecord.spanId ? Buffer.from(logRecord.spanId).toString('hex') : undefined,
                  flags: logRecord.flags,
                  // Add our flattened attributes
                  resourceAttributes,
                  scopeAttributes
                };
                
                // Process log attributes
                if (logRecord.attributes && Array.isArray(logRecord.attributes)) {
                  logRecord.attributes.forEach(attr => {
                    if (attr.key && logEntry.attributes) {
                      logEntry.attributes[attr.key] = extractAnyValue(attr.value);
                    }
                  });
                }
                
                logRecords.push(logEntry);
              });
            }
          });
        }
      });
    }

    // Sort logs by timestamp (newest first) for better user experience
    return logRecords.sort((a, b) => {
      const timeA = a.timeUnixNano ? Number(a.timeUnixNano) : 0;
      const timeB = b.timeUnixNano ? Number(b.timeUnixNano) : 0;
      return timeB - timeA;
    });
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
}

/**
 * Maps numeric severity levels to human-readable text representations
 * Based on OpenTelemetry severity level specifications
 * 
 * @param {number | undefined} severityNumber - The numeric severity level
 * @returns {string} Human-readable severity text (TRACE, DEBUG, INFO, etc.)
 */
// Helper function to get severity text from severity number
export function getSeverityText(severityNumber?: number): string {
  switch (severityNumber) {
    case 1: return 'TRACE';
    case 2: return 'TRACE2';
    case 3: return 'TRACE3';
    case 4: return 'TRACE4';
    case 5: return 'DEBUG';
    case 6: return 'DEBUG2';
    case 7: return 'DEBUG3';
    case 8: return 'DEBUG4';
    case 9: return 'INFO';
    case 10: return 'INFO2';
    case 11: return 'INFO3';
    case 12: return 'INFO4';
    case 13: return 'WARN';
    case 14: return 'WARN2';
    case 15: return 'WARN3';
    case 16: return 'WARN4';
    case 17: return 'ERROR';
    case 18: return 'ERROR2';
    case 19: return 'ERROR3';
    case 20: return 'ERROR4';
    case 21: return 'FATAL';
    case 22: return 'FATAL2';
    case 23: return 'FATAL3';
    case 24: return 'FATAL4';
    default: return 'UNSPECIFIED';
  }
}

// Helper function to get severity color from severity number
export function getSeverityColor(severityNumber?: number): string {
  if (!severityNumber) return 'bg-gray-100 text-gray-800';
  
  if (severityNumber >= 1 && severityNumber <= 8) {
    return 'bg-blue-100 text-blue-800'; // Debug and Trace
  } else if (severityNumber >= 9 && severityNumber <= 12) {
    return 'bg-green-100 text-green-800'; // Info
  } else if (severityNumber >= 13 && severityNumber <= 16) {
    return 'bg-yellow-100 text-yellow-800'; // Warn
  } else if (severityNumber >= 17 && severityNumber <= 20) {
    return 'bg-red-100 text-red-800'; // Error
  } else if (severityNumber >= 21) {
    return 'bg-purple-100 text-purple-800'; // Fatal
  }
  
  return 'bg-gray-100 text-gray-800';
}

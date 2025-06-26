/**
 * OpenTelemetry Protocol (OTLP) TypeScript Type Definitions
 * 
 * This file imports types from the @opentelemetry/otlp-transformer internal modules
 * for logs as defined in the OpenTelemetry specification.
 * 
 * OTLP uses a hierarchical structure:
 * - ExportLogsServiceRequest (top level)
 *   - ResourceLogs (logs grouped by resource)
 *     - ScopeLogs (logs grouped by instrumentation scope)
 *       - LogRecord (individual log entries)
 */

// Import types from @opentelemetry/otlp-transformer internal modules
import type { 
  IExportLogsServiceRequest as OTLPExportLogsServiceRequest,
  IResourceLogs as OTLPResourceLogs,
  ILogRecord as OTLPLogRecord,
  IScopeLogs as OTLPScopeLogs,
} from '@opentelemetry/otlp-transformer/build/esm/logs/internal-types';

import type {
  Resource,
  IInstrumentationScope as OTLPInstrumentationScope,
  IKeyValue as OTLPKeyValue,
  IAnyValue
} from '@opentelemetry/otlp-transformer/build/esm/common/internal-types';

// Re-export the imported types with the original names
export type { 
  OTLPExportLogsServiceRequest as IExportLogsServiceRequest,
  OTLPResourceLogs as IResourceLogs, 
  OTLPLogRecord as ILogRecord,
  OTLPScopeLogs as IScopeLogs,
  Resource as IResource,
  OTLPInstrumentationScope as IInstrumentationScope,
  OTLPKeyValue as IKeyValue
};

/**
 * Helper type for extracting primitive values from IAnyValue
 * This simplifies handling of the complex OTLP value structure
 */
export type ExtractedAnyValue = string | number | boolean | null;

/**
 * Helper function to extract a primitive value from an IAnyValue
 */
export function extractAnyValue(value?: IAnyValue): ExtractedAnyValue {
  if (!value) return null;
  
  if (value.stringValue !== undefined && value.stringValue !== null) {
    return value.stringValue;
  }
  if (value.intValue !== undefined && value.intValue !== null) {
    return value.intValue;
  }
  if (value.doubleValue !== undefined && value.doubleValue !== null) {
    return value.doubleValue;
  }
  if (value.boolValue !== undefined && value.boolValue !== null) {
    return value.boolValue;
  }
  
  return null;
}

/**
 * Helper function to extract a string value from an IAnyValue
 * Specifically for log body content
 */
export function extractStringValue(value?: IAnyValue): string {
  if (!value || value.stringValue === undefined || value.stringValue === null) {
    return '';
  }
  return value.stringValue;
}

/**
 * Union type for all possible attribute values in our application
 * Simplifies handling of different value types compared to the complex OTLP structure
 */
export type AttributeValue = string | number | boolean | null;

/**
 * Extended LogEntry type used in our application
 * Enhances the standard OTLP LogRecord with flattened resource and scope attributes
 * for easier rendering in the UI
 */
export interface LogEntry {
  /** Timestamp of the log in nanoseconds since Unix epoch */
  timeUnixNano: string | number;
  /** Numerical representation of the severity level (1-24) */
  severityNumber?: number;
  /** Text representation of the severity (e.g., INFO, ERROR) */
  severityText?: string;
  /** The actual log message content */
  body?: string;
  /** Additional attributes attached to this specific log record */
  attributes?: Record<string, AttributeValue>;
  /** Count of attributes that were dropped due to limits */
  droppedAttributesCount?: number;
  /** Trace ID for distributed tracing context */
  traceId?: string;
  /** Span ID for distributed tracing context */
  spanId?: string;
  /** Trace flags for distributed tracing context */
  flags?: number;
  /** Flattened resource attributes as key-value pairs */
  resourceAttributes?: Record<string, AttributeValue>;
  /** Flattened scope attributes as key-value pairs */
  scopeAttributes?: Record<string, AttributeValue>;
}

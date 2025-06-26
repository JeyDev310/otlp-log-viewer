import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LogEntry } from '@/types/otlp';
import { format } from 'date-fns';

interface LogHistogramProps {
  logs: LogEntry[];
}

interface HistogramBucket {
  time: string;
  count: number;
}

export default function LogHistogram({ logs }: LogHistogramProps) {
  // Format timestamp for display
  const formatTimestamp = (nanosTimestamp: number): string => {
    const milliseconds = nanosTimestamp / 1_000_000;
    const date = new Date(milliseconds);
    return format(date, 'HH:mm:ss');
  };

  const histogramData = useMemo<HistogramBucket[]>(() => {
    if (!logs || logs.length === 0) return [];

    // Sort logs by timestamp
    const sortedLogs = [...logs].sort((a, b) => {
      const timeA = a.timeUnixNano ? Number(a.timeUnixNano) : 0;
      const timeB = b.timeUnixNano ? Number(b.timeUnixNano) : 0;
      return timeA - timeB;
    });

    // Find the min and max timestamps
    const minTime = sortedLogs[0].timeUnixNano ? Number(sortedLogs[0].timeUnixNano) : 0;
    const maxTime = sortedLogs[sortedLogs.length - 1].timeUnixNano 
      ? Number(sortedLogs[sortedLogs.length - 1].timeUnixNano) 
      : 0;

    // If we don't have valid timestamps, return empty data
    if (minTime === 0 || maxTime === 0) return [];

    // Calculate the time range in seconds
    const timeRangeNanos = maxTime - minTime;
    const timeRangeSeconds = timeRangeNanos / 1_000_000_000;
    
    // Determine the number of buckets based on the time range
    // We want roughly 10-20 buckets for a good visualization
    const numBuckets = Math.min(Math.max(10, Math.ceil(timeRangeSeconds / 5)), 20);
    
    // Calculate bucket size in nanoseconds
    const bucketSizeNanos = timeRangeNanos / numBuckets;
    
    // Initialize buckets
    const buckets: { time: number; count: number }[] = Array.from({ length: numBuckets }, (_, i) => ({
      time: minTime + i * bucketSizeNanos,
      count: 0
    }));
    
    // Count logs in each bucket
    logs.forEach(log => {
      if (!log.timeUnixNano) return;
      
      const time = Number(log.timeUnixNano);
      const bucketIndex = Math.min(
        Math.floor((time - minTime) / bucketSizeNanos),
        numBuckets - 1
      );
      
      if (bucketIndex >= 0 && bucketIndex < buckets.length) {
        buckets[bucketIndex].count++;
      }
    });
    
    // Format the time for display
    return buckets.map(bucket => ({
      time: formatTimestamp(bucket.time),
      count: bucket.count
    }));
  }, [logs]);

  if (histogramData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
        <p className="text-gray-500">No data available for histogram</p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={histogramData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            label={{ value: 'Time', position: 'insideBottomRight', offset: -10 }}
            angle={-45}
            textAnchor="end"
          />
          <YAxis 
            label={{ value: 'Count', angle: -90, position: 'insideLeft' }}
          />
          <Tooltip 
            formatter={(value: number) => [`${value} logs`, 'Count']}
            labelFormatter={(label: string) => `Time: ${label}`}
          />
          <Bar dataKey="count" fill="#4f46e5" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

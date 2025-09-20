import { useEffect, useRef, useCallback } from 'react';

interface PerformanceMetrics {
  // Core Web Vitals
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift

  // Custom metrics
  pageLoadTime?: number;
  componentRenderTime?: number;
  animationFrameRate?: number;
  memoryUsage?: number;
  navigationTiming?: PerformanceNavigationTiming;
}

interface PerformanceConfig {
  enableMonitoring: boolean;
  sampleRate: number; // 0-1, percentage of sessions to monitor
  reportInterval: number; // ms
  maxReports: number;
}

const DEFAULT_CONFIG: PerformanceConfig = {
  enableMonitoring: true,
  sampleRate: 1.0, // Monitor 100% in development
  reportInterval: 30000, // 30 seconds
  maxReports: 20
};

export const usePerformanceMonitoring = (config: Partial<PerformanceConfig> = {}) => {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const reportCountRef = useRef(0);
  const observersRef = useRef<PerformanceObserver[]>([]);

  // Check if we should monitor this session
  const shouldMonitor = useRef(Math.random() < finalConfig.sampleRate);

  // Initialize performance monitoring
  useEffect(() => {
    if (!shouldMonitor.current || !finalConfig.enableMonitoring) return;

    initializeMonitoring();

    return () => {
      // Cleanup observers
      observersRef.current.forEach(observer => observer.disconnect());
    };
  }, [finalConfig.enableMonitoring]);

  const initializeMonitoring = () => {
    // Monitor Core Web Vitals
    if ('PerformanceObserver' in window) {
      setupWebVitalsMonitoring();
    }

    // Monitor page load performance
    setupPageLoadMonitoring();

    // Monitor memory usage
    setupMemoryMonitoring();

    // Monitor animation performance
    setupAnimationMonitoring();

    // Start periodic reporting
    const reportInterval = setInterval(() => {
      if (reportCountRef.current < finalConfig.maxReports) {
        reportMetrics();
        reportCountRef.current++;
      } else {
        clearInterval(reportInterval);
      }
    }, finalConfig.reportInterval);
  };

  const setupWebVitalsMonitoring = () => {
    try {
      // First Contentful Paint
      const fcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
        if (fcpEntry) {
          recordMetric({ fcp: fcpEntry.startTime });
        }
      });
      fcpObserver.observe({ entryTypes: ['paint'] });
      observersRef.current.push(fcpObserver);

      // Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        recordMetric({ lcp: lastEntry.startTime });
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      observersRef.current.push(lcpObserver);

      // First Input Delay
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (entry.name === 'first-input') {
            const fid = (entry as any).processingStart - entry.startTime;
            recordMetric({ fid });
          }
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
      observersRef.current.push(fidObserver);

      // Cumulative Layout Shift
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        let clsValue = 0;
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        recordMetric({ cls: clsValue });
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
      observersRef.current.push(clsObserver);
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }
  };

  const setupPageLoadMonitoring = () => {
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (navigationTiming && navigationTiming.loadEventEnd > 0) {
      const pageLoadTime = navigationTiming.loadEventEnd - navigationTiming.fetchStart;
      recordMetric({
        pageLoadTime,
        navigationTiming
      });
    }
  };

  const setupMemoryMonitoring = () => {
    // Monitor memory usage (Chrome only)
    if ('memory' in performance) {
      const memoryInfo = (performance as any).memory;
      recordMetric({
        memoryUsage: memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize
      });
    }
  };

  const setupAnimationMonitoring = () => {
    let frameCount = 0;
    let startTime = performance.now();
    const targetFPS = 60;

    const countFrame = () => {
      frameCount++;
      const currentTime = performance.now();
      const elapsed = currentTime - startTime;

      if (elapsed >= 1000) { // Every second
        const fps = (frameCount * 1000) / elapsed;
        recordMetric({ animationFrameRate: fps });

        frameCount = 0;
        startTime = currentTime;
      }

      requestAnimationFrame(countFrame);
    };

    requestAnimationFrame(countFrame);
  };

  const recordMetric = (metric: Partial<PerformanceMetrics>) => {
    const timestamp = performance.now();
    metricsRef.current.push({
      ...metric,
      timestamp
    } as any);

    // Keep only recent metrics
    if (metricsRef.current.length > 100) {
      metricsRef.current = metricsRef.current.slice(-50);
    }
  };

  const reportMetrics = () => {
    if (metricsRef.current.length === 0) return;

    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connectionType: getConnectionType(),
      metrics: [...metricsRef.current],
      summary: calculateSummary()
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚀 Performance Report');
      console.log('Summary:', report.summary);
      console.log('Raw metrics:', report.metrics);
      console.groupEnd();
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      sendToMonitoringService(report);
    }

    // Clear metrics after reporting
    metricsRef.current = [];
  };

  const calculateSummary = () => {
    const recent = metricsRef.current.slice(-10);

    const summary: any = {
      metricsCount: recent.length,
      timestamp: performance.now()
    };

    // Calculate averages
    const avgFPS = recent
      .filter(m => m.animationFrameRate)
      .reduce((sum, m) => sum + (m.animationFrameRate || 0), 0) /
      recent.filter(m => m.animationFrameRate).length || 0;

    if (avgFPS > 0) summary.averageFPS = Math.round(avgFPS);

    // Get latest values
    const latest = recent[recent.length - 1];
    if (latest?.fcp) summary.firstContentfulPaint = Math.round(latest.fcp);
    if (latest?.lcp) summary.largestContentfulPaint = Math.round(latest.lcp);
    if (latest?.fid) summary.firstInputDelay = Math.round(latest.fid);
    if (latest?.cls) summary.cumulativeLayoutShift = latest.cls.toFixed(3);
    if (latest?.pageLoadTime) summary.pageLoadTime = Math.round(latest.pageLoadTime);
    if (latest?.memoryUsage) summary.memoryUsage = (latest.memoryUsage * 100).toFixed(1) + '%';

    return summary;
  };

  const getConnectionType = () => {
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null;
  };

  const sendToMonitoringService = async (report: any) => {
    try {
      // Example: Send to monitoring endpoint
      // await fetch('/api/performance', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(report)
      // });

      // For now, store in localStorage for review
      const stored = localStorage.getItem('kickoff-performance-logs');
      const logs = stored ? JSON.parse(stored) : [];
      logs.push(report);

      // Keep only last 10 reports
      if (logs.length > 10) {
        logs.splice(0, logs.length - 10);
      }

      localStorage.setItem('kickoff-performance-logs', JSON.stringify(logs));
    } catch (error) {
      console.warn('Failed to send performance metrics:', error);
    }
  };

  // Manual performance marking
  const markStart = useCallback((label: string) => {
    if (shouldMonitor.current) {
      performance.mark(`${label}-start`);
    }
  }, []);

  const markEnd = useCallback((label: string) => {
    if (shouldMonitor.current) {
      performance.mark(`${label}-end`);
      performance.measure(label, `${label}-start`, `${label}-end`);

      const measure = performance.getEntriesByName(label)[0];
      if (measure) {
        recordMetric({ componentRenderTime: measure.duration });
      }
    }
  }, []);

  // Get current performance summary
  const getCurrentMetrics = useCallback(() => {
    return calculateSummary();
  }, []);

  // Export performance logs
  const exportLogs = useCallback(() => {
    const logs = localStorage.getItem('kickoff-performance-logs');
    if (logs) {
      const blob = new Blob([logs], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `kickoff-performance-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, []);

  return {
    markStart,
    markEnd,
    getCurrentMetrics,
    exportLogs,
    isMonitoring: shouldMonitor.current && finalConfig.enableMonitoring
  };
};
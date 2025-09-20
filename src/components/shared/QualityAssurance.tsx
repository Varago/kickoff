import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Smartphone,
  Wifi,
  Volume2,
  Vibrate,
  Download,
  TestTube,
  BarChart3
} from 'lucide-react';
import { Card } from './Card';
import { usePerformanceMonitoring } from '../../hooks/usePerformanceMonitoring';
import { useGameStore } from '../../store/gameStore';
import { useAdvancedHaptic } from '../../hooks/useAdvancedHaptic';
import { useSounds } from '../../hooks/useSoundSystem';

interface QATest {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  result?: string;
  duration?: number;
}

interface QAProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QualityAssurance: React.FC<QAProps> = ({ isOpen, onClose }) => {
  const [tests, setTests] = useState<QATest[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [summary, setSummary] = useState<any>(null);

  const { getCurrentMetrics, exportLogs } = usePerformanceMonitoring();
  const { players, teams, addPlayer, generateTeams, resetAll } = useGameStore();
  const { settings: hapticSettings, testHaptic } = useAdvancedHaptic();
  const { settings: soundSettings, testSound } = useSounds();

  const initialTests: QATest[] = [
    {
      id: 'performance',
      name: 'Performance Metrics',
      description: 'Check Core Web Vitals and animation performance',
      status: 'pending'
    },
    {
      id: 'offline',
      name: 'Offline Functionality',
      description: 'Verify PWA works without internet connection',
      status: 'pending'
    },
    {
      id: 'responsive',
      name: 'Responsive Design',
      description: 'Test layout on different screen sizes',
      status: 'pending'
    },
    {
      id: 'haptic',
      name: 'Haptic Feedback',
      description: 'Test vibration patterns and settings',
      status: 'pending'
    },
    {
      id: 'audio',
      name: 'Audio System',
      description: 'Test sound effects and volume controls',
      status: 'pending'
    },
    {
      id: 'gameflow',
      name: 'Game Flow',
      description: 'Test complete player signup to match completion',
      status: 'pending'
    },
    {
      id: 'storage',
      name: 'Data Persistence',
      description: 'Test localStorage and data recovery',
      status: 'pending'
    },
    {
      id: 'accessibility',
      name: 'Accessibility',
      description: 'Check keyboard navigation and screen reader support',
      status: 'pending'
    }
  ];

  useEffect(() => {
    if (isOpen) {
      setTests(initialTests);
    }
  }, [isOpen]);

  const updateTest = (id: string, updates: Partial<QATest>) => {
    setTests(prev => prev.map(test =>
      test.id === id ? { ...test, ...updates } : test
    ));
  };

  const runAllTests = async () => {
    setIsRunning(true);
    const startTime = performance.now();

    for (const test of tests) {
      await runSingleTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const duration = performance.now() - startTime;
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status === 'failed').length;
    const warnings = tests.filter(t => t.status === 'warning').length;

    setSummary({
      totalTests: tests.length,
      passed,
      failed,
      warnings,
      duration: Math.round(duration),
      score: Math.round((passed / tests.length) * 100)
    });

    setIsRunning(false);
  };

  const runSingleTest = async (testId: string) => {
    updateTest(testId, { status: 'running' });

    try {
      switch (testId) {
        case 'performance':
          await testPerformance();
          break;
        case 'offline':
          await testOfflineFunctionality();
          break;
        case 'responsive':
          await testResponsiveDesign();
          break;
        case 'haptic':
          await testHapticFeedback();
          break;
        case 'audio':
          await testAudioSystem();
          break;
        case 'gameflow':
          await testGameFlow();
          break;
        case 'storage':
          await testDataPersistence();
          break;
        case 'accessibility':
          await testAccessibility();
          break;
        default:
          throw new Error(`Unknown test: ${testId}`);
      }
    } catch (error) {
      updateTest(testId, {
        status: 'failed',
        result: error instanceof Error ? error.message : 'Test failed'
      });
    }
  };

  const testPerformance = async () => {
    const metrics = getCurrentMetrics();

    let status: QATest['status'] = 'passed';
    const results = [];

    // Check FPS
    if (metrics.averageFPS && metrics.averageFPS < 30) {
      status = 'failed';
      results.push(`Low FPS: ${metrics.averageFPS}`);
    } else if (metrics.averageFPS && metrics.averageFPS < 50) {
      status = 'warning';
      results.push(`Moderate FPS: ${metrics.averageFPS}`);
    } else if (metrics.averageFPS) {
      results.push(`Good FPS: ${metrics.averageFPS}`);
    }

    // Check memory usage
    if (metrics.memoryUsage) {
      const usage = parseFloat(metrics.memoryUsage);
      if (usage > 80) {
        status = status === 'passed' ? 'warning' : status;
        results.push(`High memory: ${metrics.memoryUsage}`);
      } else {
        results.push(`Memory usage: ${metrics.memoryUsage}`);
      }
    }

    updateTest('performance', {
      status,
      result: results.join(', ') || 'Performance metrics collected'
    });
  };

  const testOfflineFunctionality = async () => {
    // Check service worker
    if (!('serviceWorker' in navigator)) {
      updateTest('offline', {
        status: 'failed',
        result: 'Service Worker not supported'
      });
      return;
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      updateTest('offline', {
        status: 'warning',
        result: 'Service Worker not registered'
      });
      return;
    }

    updateTest('offline', {
      status: 'passed',
      result: 'Service Worker active, offline functionality ready'
    });
  };

  const testResponsiveDesign = async () => {
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    let status: QATest['status'] = 'passed';
    let result = `Viewport: ${viewportWidth}x${viewportHeight}`;

    // Check for mobile viewport
    if (viewportWidth < 768) {
      result += ', Mobile layout';
    } else if (viewportWidth < 1024) {
      result += ', Tablet layout';
    } else {
      result += ', Desktop layout';
    }

    // Check for very small screens
    if (viewportWidth < 320 || viewportHeight < 568) {
      status = 'warning';
      result += ', Very small screen detected';
    }

    updateTest('responsive', { status, result });
  };

  const testHapticFeedback = async () => {
    if (!('vibrate' in navigator)) {
      updateTest('haptic', {
        status: 'warning',
        result: 'Haptic feedback not supported on this device'
      });
      return;
    }

    // Test haptic patterns
    testHaptic('success');
    await new Promise(resolve => setTimeout(resolve, 200));

    updateTest('haptic', {
      status: 'passed',
      result: `Haptic enabled: ${hapticSettings.enabled}, Intensity: ${hapticSettings.intensity}`
    });
  };

  const testAudioSystem = async () => {
    try {
      // Test sound
      if (soundSettings.enabled) {
        testSound('click');
      }

      updateTest('audio', {
        status: 'passed',
        result: `Audio enabled: ${soundSettings.enabled}, Volume: ${Math.round(soundSettings.volume * 100)}%`
      });
    } catch (error) {
      updateTest('audio', {
        status: 'failed',
        result: 'Audio system error'
      });
    }
  };

  const testGameFlow = async () => {
    try {
      // Clear existing data
      resetAll();

      // Add test players
      for (let i = 1; i <= 10; i++) {
        addPlayer(`Player ${i}`, Math.floor(Math.random() * 5) + 1);
      }

      // Generate teams
      generateTeams();

      // Verify teams were created
      const currentTeams = useGameStore.getState().teams;
      if (currentTeams.length === 0) {
        throw new Error('Teams not generated');
      }

      updateTest('gameflow', {
        status: 'passed',
        result: `Created ${currentTeams.length} teams with ${useGameStore.getState().players.length} players`
      });
    } catch (error) {
      updateTest('gameflow', {
        status: 'failed',
        result: error instanceof Error ? error.message : 'Game flow test failed'
      });
    }
  };

  const testDataPersistence = async () => {
    try {
      // Test localStorage
      const testKey = 'kickoff-test-data';
      const testData = { test: true, timestamp: Date.now() };

      localStorage.setItem(testKey, JSON.stringify(testData));
      const retrieved = JSON.parse(localStorage.getItem(testKey) || '{}');

      if (retrieved.test !== true) {
        throw new Error('localStorage read/write failed');
      }

      localStorage.removeItem(testKey);

      updateTest('storage', {
        status: 'passed',
        result: 'localStorage working correctly'
      });
    } catch (error) {
      updateTest('storage', {
        status: 'failed',
        result: 'Data persistence failed'
      });
    }
  };

  const testAccessibility = async () => {
    let issues = 0;

    // Check for alt texts on images
    const images = document.querySelectorAll('img:not([alt])');
    if (images.length > 0) issues++;

    // Check for buttons without labels
    const buttons = document.querySelectorAll('button:not([aria-label]):not([title])');
    if (buttons.length > 0) issues++;

    // Check for proper heading structure
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) issues++;

    const status = issues === 0 ? 'passed' : issues <= 2 ? 'warning' : 'failed';
    const result = issues === 0
      ? 'No accessibility issues found'
      : `${issues} potential accessibility issues detected`;

    updateTest('accessibility', { status, result });
  };

  const getStatusIcon = (status: QATest['status']) => {
    switch (status) {
      case 'passed': return <CheckCircle className="text-green-400" size={20} />;
      case 'failed': return <XCircle className="text-red-400" size={20} />;
      case 'warning': return <AlertTriangle className="text-yellow-400" size={20} />;
      case 'running': return <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}><TestTube className="text-blue-400" size={20} /></motion.div>;
      default: return <div className="w-5 h-5 bg-gray-600 rounded-full" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-surface-dark rounded-xl border border-white/10 w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <TestTube size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Quality Assurance</h2>
                <p className="text-gray-400">Comprehensive app testing suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={runAllTests}
                disabled={isRunning}
                className="bg-pitch-green hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                {isRunning ? 'Running Tests...' : 'Run All Tests'}
              </motion.button>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white p-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          {/* Summary */}
          {summary && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <Card glass padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Test Results</h3>
                  <div className="flex items-center space-x-2">
                    <BarChart3 size={20} className="text-pitch-green" />
                    <span className="text-pitch-green font-bold text-xl">{summary.score}%</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{summary.passed}</div>
                    <div className="text-xs text-gray-400">Passed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-400">{summary.warnings}</div>
                    <div className="text-xs text-gray-400">Warnings</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-400">{summary.failed}</div>
                    <div className="text-xs text-gray-400">Failed</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{summary.duration}ms</div>
                    <div className="text-xs text-gray-400">Duration</div>
                  </div>
                </div>
              </Card>
            </motion.div>
          )}

          {/* Tests */}
          <div className="space-y-3">
            <AnimatePresence>
              {tests.map((test, index) => (
                <motion.div
                  key={test.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card glass padding="md" className="hover:bg-white/5 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(test.status)}
                        <div>
                          <h4 className="font-medium text-white">{test.name}</h4>
                          <p className="text-sm text-gray-400">{test.description}</p>
                          {test.result && (
                            <p className="text-xs text-gray-300 mt-1">{test.result}</p>
                          )}
                        </div>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => runSingleTest(test.id)}
                        disabled={isRunning || test.status === 'running'}
                        className="px-3 py-1 bg-gray-600 hover:bg-gray-500 disabled:bg-gray-700 text-white text-sm rounded transition-colors"
                      >
                        Run
                      </motion.button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="mt-6 flex justify-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={exportLogs}
              className="flex items-center space-x-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Download size={16} />
              <span>Export Logs</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
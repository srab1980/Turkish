import { performance } from 'perf_hooks';

/**
 * Performance Monitoring and Benchmarking Utilities
 */

export interface PerformanceMetrics {
  duration: number;
  memoryUsage: {
    heapUsed: number;
    heapTotal: number;
    external: number;
    rss: number;
  };
  cpuUsage?: {
    user: number;
    system: number;
  };
  timestamp: number;
}

export interface BenchmarkResult {
  name: string;
  metrics: PerformanceMetrics;
  iterations: number;
  averageDuration: number;
  minDuration: number;
  maxDuration: number;
  standardDeviation: number;
}

export class PerformanceMonitor {
  private startTime: number = 0;
  private startMemory: NodeJS.MemoryUsage;
  private startCPU?: NodeJS.CpuUsage;

  constructor() {
    this.startMemory = process.memoryUsage();
  }

  start(): void {
    this.startTime = performance.now();
    this.startMemory = process.memoryUsage();
    this.startCPU = process.cpuUsage();
  }

  end(): PerformanceMetrics {
    const endTime = performance.now();
    const endMemory = process.memoryUsage();
    const endCPU = this.startCPU ? process.cpuUsage(this.startCPU) : undefined;

    return {
      duration: endTime - this.startTime,
      memoryUsage: {
        heapUsed: endMemory.heapUsed - this.startMemory.heapUsed,
        heapTotal: endMemory.heapTotal - this.startMemory.heapTotal,
        external: endMemory.external - this.startMemory.external,
        rss: endMemory.rss - this.startMemory.rss,
      },
      cpuUsage: endCPU ? {
        user: endCPU.user / 1000, // Convert to milliseconds
        system: endCPU.system / 1000,
      } : undefined,
      timestamp: Date.now(),
    };
  }

  static async measure<T>(
    operation: () => Promise<T> | T,
    name: string = 'operation'
  ): Promise<{ result: T; metrics: PerformanceMetrics }> {
    const monitor = new PerformanceMonitor();
    monitor.start();

    const result = await operation();
    const metrics = monitor.end();

    console.log(`Performance [${name}]:`, {
      duration: `${metrics.duration.toFixed(2)}ms`,
      memoryDelta: `${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`,
      cpuUser: metrics.cpuUsage ? `${metrics.cpuUsage.user.toFixed(2)}ms` : 'N/A',
    });

    return { result, metrics };
  }
}

export class BenchmarkSuite {
  private results: BenchmarkResult[] = [];

  async benchmark<T>(
    operation: () => Promise<T> | T,
    name: string,
    iterations: number = 100
  ): Promise<BenchmarkResult> {
    const durations: number[] = [];
    let totalMetrics: PerformanceMetrics | null = null;

    console.log(`Running benchmark: ${name} (${iterations} iterations)`);

    for (let i = 0; i < iterations; i++) {
      const monitor = new PerformanceMonitor();
      monitor.start();

      await operation();

      const metrics = monitor.end();
      durations.push(metrics.duration);

      if (i === 0) {
        totalMetrics = metrics;
      }

      // Progress indicator
      if ((i + 1) % Math.max(1, Math.floor(iterations / 10)) === 0) {
        console.log(`Progress: ${i + 1}/${iterations}`);
      }
    }

    const averageDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
    const minDuration = Math.min(...durations);
    const maxDuration = Math.max(...durations);
    
    // Calculate standard deviation
    const variance = durations.reduce((acc, duration) => {
      return acc + Math.pow(duration - averageDuration, 2);
    }, 0) / durations.length;
    const standardDeviation = Math.sqrt(variance);

    const result: BenchmarkResult = {
      name,
      metrics: totalMetrics!,
      iterations,
      averageDuration,
      minDuration,
      maxDuration,
      standardDeviation,
    };

    this.results.push(result);
    this.printBenchmarkResult(result);

    return result;
  }

  private printBenchmarkResult(result: BenchmarkResult): void {
    console.log(`\n=== Benchmark Results: ${result.name} ===`);
    console.log(`Iterations: ${result.iterations}`);
    console.log(`Average Duration: ${result.averageDuration.toFixed(2)}ms`);
    console.log(`Min Duration: ${result.minDuration.toFixed(2)}ms`);
    console.log(`Max Duration: ${result.maxDuration.toFixed(2)}ms`);
    console.log(`Standard Deviation: ${result.standardDeviation.toFixed(2)}ms`);
    console.log(`Memory Usage: ${(result.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB`);
    if (result.metrics.cpuUsage) {
      console.log(`CPU Usage: ${result.metrics.cpuUsage.user.toFixed(2)}ms user, ${result.metrics.cpuUsage.system.toFixed(2)}ms system`);
    }
    console.log('=====================================\n');
  }

  getResults(): BenchmarkResult[] {
    return this.results;
  }

  generateReport(): string {
    let report = '# Performance Benchmark Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;

    this.results.forEach(result => {
      report += `## ${result.name}\n\n`;
      report += `- **Iterations**: ${result.iterations}\n`;
      report += `- **Average Duration**: ${result.averageDuration.toFixed(2)}ms\n`;
      report += `- **Min Duration**: ${result.minDuration.toFixed(2)}ms\n`;
      report += `- **Max Duration**: ${result.maxDuration.toFixed(2)}ms\n`;
      report += `- **Standard Deviation**: ${result.standardDeviation.toFixed(2)}ms\n`;
      report += `- **Memory Usage**: ${(result.metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB\n`;
      if (result.metrics.cpuUsage) {
        report += `- **CPU Usage**: ${result.metrics.cpuUsage.user.toFixed(2)}ms user, ${result.metrics.cpuUsage.system.toFixed(2)}ms system\n`;
      }
      report += '\n';
    });

    return report;
  }
}

/**
 * Frontend Performance Testing Utilities
 */
export class FrontendPerformanceMonitor {
  static measurePageLoad(): Promise<PerformanceNavigationTiming> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.performance) {
        window.addEventListener('load', () => {
          const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
          resolve(navigation);
        });
      } else {
        // Mock for Node.js environment
        resolve({
          domContentLoadedEventEnd: 500,
          loadEventEnd: 1000,
          responseEnd: 300,
          requestStart: 0,
        } as PerformanceNavigationTiming);
      }
    });
  }

  static measureResourceLoading(): PerformanceResourceTiming[] {
    if (typeof window !== 'undefined' && window.performance) {
      return performance.getEntriesByType('resource') as PerformanceResourceTiming[];
    }
    return [];
  }

  static measureLargestContentfulPaint(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          resolve(lastEntry.startTime);
          observer.disconnect();
        });
        observer.observe({ entryTypes: ['largest-contentful-paint'] });
      } else {
        // Mock for testing
        resolve(1200);
      }
    });
  }

  static measureFirstInputDelay(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const firstEntry = entries[0];
          resolve(firstEntry.processingStart - firstEntry.startTime);
          observer.disconnect();
        });
        observer.observe({ entryTypes: ['first-input'] });
      } else {
        // Mock for testing
        resolve(50);
      }
    });
  }

  static measureCumulativeLayoutShift(): Promise<number> {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
        let clsValue = 0;
        const observer = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!(entry as any).hadRecentInput) {
              clsValue += (entry as any).value;
            }
          }
          resolve(clsValue);
        });
        observer.observe({ entryTypes: ['layout-shift'] });
        
        // Resolve after 5 seconds
        setTimeout(() => {
          observer.disconnect();
          resolve(clsValue);
        }, 5000);
      } else {
        // Mock for testing
        resolve(0.1);
      }
    });
  }
}

/**
 * Memory Leak Detection
 */
export class MemoryLeakDetector {
  private initialMemory: NodeJS.MemoryUsage;
  private samples: NodeJS.MemoryUsage[] = [];

  constructor() {
    this.initialMemory = process.memoryUsage();
  }

  takeSample(): void {
    this.samples.push(process.memoryUsage());
  }

  detectLeaks(): {
    hasLeak: boolean;
    heapGrowth: number;
    recommendations: string[];
  } {
    if (this.samples.length < 2) {
      return {
        hasLeak: false,
        heapGrowth: 0,
        recommendations: ['Take more samples to detect memory leaks'],
      };
    }

    const firstSample = this.samples[0];
    const lastSample = this.samples[this.samples.length - 1];
    const heapGrowth = lastSample.heapUsed - firstSample.heapUsed;
    const growthPercentage = (heapGrowth / firstSample.heapUsed) * 100;

    const hasLeak = growthPercentage > 50; // 50% growth threshold

    const recommendations: string[] = [];
    if (hasLeak) {
      recommendations.push('Significant memory growth detected');
      recommendations.push('Check for unclosed event listeners');
      recommendations.push('Verify proper cleanup of intervals/timeouts');
      recommendations.push('Review object references and closures');
    }

    return {
      hasLeak,
      heapGrowth,
      recommendations,
    };
  }

  generateReport(): string {
    const leak = this.detectLeaks();
    let report = '# Memory Leak Detection Report\n\n';
    report += `Generated: ${new Date().toISOString()}\n\n`;
    report += `Samples taken: ${this.samples.length}\n`;
    report += `Heap growth: ${(leak.heapGrowth / 1024 / 1024).toFixed(2)}MB\n`;
    report += `Leak detected: ${leak.hasLeak ? 'YES' : 'NO'}\n\n`;

    if (leak.recommendations.length > 0) {
      report += '## Recommendations\n\n';
      leak.recommendations.forEach(rec => {
        report += `- ${rec}\n`;
      });
    }

    return report;
  }
}

// Example usage and test functions
export async function runPerformanceTests(): Promise<void> {
  console.log('Starting performance tests...\n');

  const benchmark = new BenchmarkSuite();

  // Test 1: Simple computation
  await benchmark.benchmark(
    () => {
      let sum = 0;
      for (let i = 0; i < 10000; i++) {
        sum += i;
      }
      return sum;
    },
    'Simple Loop Computation',
    1000
  );

  // Test 2: Array operations
  await benchmark.benchmark(
    () => {
      const arr = Array.from({ length: 1000 }, (_, i) => i);
      return arr.map(x => x * 2).filter(x => x % 3 === 0).reduce((a, b) => a + b, 0);
    },
    'Array Operations',
    500
  );

  // Test 3: Object creation and manipulation
  await benchmark.benchmark(
    () => {
      const objects = [];
      for (let i = 0; i < 100; i++) {
        objects.push({
          id: i,
          name: `Object ${i}`,
          data: Array.from({ length: 10 }, (_, j) => j),
        });
      }
      return objects.length;
    },
    'Object Creation',
    200
  );

  // Generate and save report
  const report = benchmark.generateReport();
  console.log(report);
}

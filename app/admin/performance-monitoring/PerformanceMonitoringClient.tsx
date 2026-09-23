"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Activity,
  Database,
  Clock,
  TrendingUp,
  Server,
  Zap,
  RefreshCw,
  BarChart3,
  Timer,
  HardDrive,
  Wifi,
  AlertTriangle } from 'lucide-react';

interface PerformanceMetrics {
  cacheStats: {
    totalEntries: number;
    hitRate: number;
    entries: Array<{
      key: string;
      age: number;
      ttl: number;
      expired: boolean;
    }>;
  };
  systemMetrics: {
    memoryUsage: number;
    responseTime: number;
    uptime: number;
    activeConnections: number;
  };
  pageMetrics: {
    averageLoadTime: number;
    slowestPages: Array<{
      path: string;
      loadTime: number;
      cacheHit: boolean;
    }>;
  };
}

export default function PerformanceMonitoringClient() {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchMetrics = async () => {
    setIsLoading(true);
    try {
      // Simulate fetching performance metrics
      // In a real implementation, this would call your performance monitoring API
      const mockMetrics: PerformanceMetrics = {
        cacheStats: {
          totalEntries: 45,
          hitRate: 87.3,
          entries: [
            { key: 'United States:Las Vegas', age: 300000, ttl: 600000, expired: false },
            { key: 'Germany:Berlin', age: 150000, ttl: 600000, expired: false },
            { key: 'United Arab Emirates:Dubai', age: 800000, ttl: 600000, expired: true },
            { key: 'Australia:Sydney', age: 200000, ttl: 600000, expired: false },
            { key: 'United Kingdom:London', age: 450000, ttl: 600000, expired: false },
          ]
        },
        systemMetrics: {
          memoryUsage: 68.5,
          responseTime: 245,
          uptime: 2847600, // seconds
          activeConnections: 127
        },
        pageMetrics: {
          averageLoadTime: 1.2,
          slowestPages: [
            { path: '/exhibition-stands/united-states', loadTime: 2.8, cacheHit: false },
            { path: '/exhibition-stands/germany/berlin', loadTime: 1.9, cacheHit: true },
            { path: '/builders', loadTime: 1.7, cacheHit: false },
            { path: '/exhibition-stands/united-arab-emirates/dubai', loadTime: 1.5, cacheHit: true },
            { path: '/quote', loadTime: 1.3, cacheHit: false },
          ]
        }
      };

      setMetrics(mockMetrics);
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Failed to fetch performance metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCache = async () => {
    try {
      // In a real implementation, this would call your cache clearing API
      console.log('Clearing cache...');
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      await fetchMetrics(); // Refresh metrics after clearing cache
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  };

  const warmCache = async () => {
    try {
      // In a real implementation, this would call your cache warming API
      console.log('Warming cache...');
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      await fetchMetrics(); // Refresh metrics after warming cache
    } catch (error) {
      console.error('Failed to warm cache:', error);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoRefresh) {
      interval = setInterval(fetchMetrics, 30000); // Refresh every 30 seconds
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const formatUptime = (seconds: number): string => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatAge = (milliseconds: number): string => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Performance Monitoring</h1>
          <p className="text-muted-foreground mt-2">
            Monitor platform performance, caching efficiency, and system metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-sm">
            <Activity className="w-4 h-4 mr-2" />
            Live Monitoring
          </Badge>
          {lastUpdated && (
            <Badge variant="secondary" className="text-xs">
              Updated: {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </div>
      </div>

      {/* Control Panel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="w-5 h-5" />
            Control Panel
          </CardTitle>
          <CardDescription>
            Manage performance monitoring and caching system
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button
            onClick={fetchMetrics}
            disabled={isLoading}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh Metrics
          </Button>
          <Button
            onClick={clearCache}
            disabled={isLoading}
            variant="outline"
          >
            <Database className="w-4 h-4 mr-2" />
            Clear Cache
          </Button>
          <Button
            onClick={warmCache}
            disabled={isLoading}
            variant="outline"
          >
            <Zap className="w-4 h-4 mr-2" />
            Warm Cache
          </Button>
          <Button
            onClick={() => setAutoRefresh(!autoRefresh)}
            variant={autoRefresh ? "default" : "outline"}
          >
            <Timer className="w-4 h-4 mr-2" />
            {autoRefresh ? 'StopCircle Auto-Refresh' : 'Start Auto-Refresh'}
          </Button>
        </CardContent>
      </Card>

      {metrics && (
        <>
          {/* System Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Memory Usage</p>
                    <p className="text-2xl font-bold">{metrics.systemMetrics.memoryUsage}%</p>
                  </div>
                  <HardDrive className="w-8 h-8 text-blue-500" />
                </div>
                <Progress value={metrics.systemMetrics.memoryUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Response Time</p>
                    <p className="text-2xl font-bold">{metrics.systemMetrics.responseTime}ms</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-500" />
                </div>
                <div className="mt-2">
                  <Badge variant={metrics.systemMetrics.responseTime < 300 ? "default" : "destructive"}>
                    {metrics.systemMetrics.responseTime < 300 ? "Good" : "Slow"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Uptime</p>
                    <p className="text-2xl font-bold">{formatUptime(metrics.systemMetrics.uptime)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active Connections</p>
                    <p className="text-2xl font-bold">{metrics.systemMetrics.activeConnections}</p>
                  </div>
                  <Wifi className="w-8 h-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cache Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Cache Performance
              </CardTitle>
              <CardDescription>
                Location cache statistics and performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{metrics.cacheStats.totalEntries}</div>
                  <div className="text-sm text-blue-700">Total Entries</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{metrics.cacheStats.hitRate}%</div>
                  <div className="text-sm text-green-700">Hit Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics.cacheStats.entries.filter(e => e.expired).length}
                  </div>
                  <div className="text-sm text-purple-700">Expired Entries</div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Cache Entries</h4>
                <div className="space-y-2">
                  {metrics.cacheStats.entries.map((entry, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={entry.expired ? "destructive" : "default"}>
                          {entry.expired ? "Expired" : "Active"}
                        </Badge>
                        <span className="font-mono text-sm">{entry.key}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        Age: {formatAge(entry.age)} / TTL: {formatAge(entry.ttl)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Page Performance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Page Performance
              </CardTitle>
              <CardDescription>
                Page load times and caching effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">{metrics.pageMetrics.averageLoadTime}s</div>
                <div className="text-sm text-yellow-700">Average Load Time</div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Slowest Pages</h4>
                <div className="space-y-2">
                  {metrics.pageMetrics.slowestPages.map((page, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant={page.cacheHit ? "default" : "secondary"}>
                          {page.cacheHit ? "Cached" : "No Cache"}
                        </Badge>
                        <span className="font-mono text-sm">{page.path}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{page.loadTime}s</span>
                        {page.loadTime > 2 && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Performance Recommendations
              </CardTitle>
              <CardDescription>
                Automated suggestions to improve platform performance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {metrics.systemMetrics.memoryUsage > 80 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>High Memory Usage:</strong> Memory usage is at {metrics.systemMetrics.memoryUsage}%. 
                    Consider clearing cache or optimizing memory-intensive operations.
                  </AlertDescription>
                </Alert>
              )}

              {metrics.systemMetrics.responseTime > 500 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Slow Response Time:</strong> Average response time is {metrics.systemMetrics.responseTime}ms. 
                    Consider enabling more aggressive caching or optimizing database queries.
                  </AlertDescription>
                </Alert>
              )}

              {metrics.cacheStats.hitRate < 70 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Low Cache Hit Rate:</strong> Cache hit rate is only {metrics.cacheStats.hitRate}%. 
                    Consider warming the cache for popular locations or increasing TTL values.
                  </AlertDescription>
                </Alert>
              )}

              {metrics.cacheStats.entries.filter(e => e.expired).length > 5 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Many Expired Entries:</strong> {metrics.cacheStats.entries.filter(e => e.expired).length} cache entries have expired. 
                    Consider running cache cleanup or adjusting TTL values.
                  </AlertDescription>
                </Alert>
              )}

              {metrics.pageMetrics.averageLoadTime > 2 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Slow Page Load Times:</strong> Average page load time is {metrics.pageMetrics.averageLoadTime}s. 
                    Consider implementing more aggressive caching strategies for location pages.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

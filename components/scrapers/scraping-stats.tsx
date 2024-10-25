// components/scrapers/scraping-stats.tsx
"use client"

import { useEffect, useState } from 'react';
import { Card, Text, Metric } from '@tremor/react';

interface ScrapingStats {
  total: number;
  successful: number;
  failed: number;
  inProgress: number;
}

export default function ScrapingStats() {
  const [stats, setStats] = useState<ScrapingStats>({
    total: 0,
    successful: 0,
    failed: 0,
    inProgress: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/scrape/stats');
        const data = await response.json();
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch scraping stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
    // Optionally set up a polling interval to refresh stats
    const interval = setInterval(fetchStats, 30000); // every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card decoration="top" decorationColor="blue">
        <Text>Total Scrapes</Text>
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mt-2"></div>
        ) : (
          <Metric>{stats.total}</Metric>
        )}
      </Card>
      
      <Card decoration="top" decorationColor="green">
        <Text>Successful</Text>
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mt-2"></div>
        ) : (
          <Metric className="text-green-600">{stats.successful}</Metric>
        )}
      </Card>
      
      <Card decoration="top" decorationColor="red">
        <Text>Failed</Text>
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mt-2"></div>
        ) : (
          <Metric className="text-red-600">{stats.failed}</Metric>
        )}
      </Card>
      
      <Card decoration="top" decorationColor="yellow">
        <Text>In Progress</Text>
        {isLoading ? (
          <div className="animate-pulse h-8 bg-gray-200 rounded w-16 mt-2"></div>
        ) : (
          <Metric className="text-yellow-600">{stats.inProgress}</Metric>
        )}
      </Card>
    </div>
  );
}
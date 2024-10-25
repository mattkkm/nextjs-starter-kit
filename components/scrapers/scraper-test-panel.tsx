// components/scrapers/scraper-test-panel.tsx
"use client"

import { useState } from 'react';
import { Card, Text, Grid, Button, Badge, TextInput, NumberInput } from '@tremor/react';
import { ScraperTestResult, SCRAPER_CONFIGS } from '@/lib/types/types';

export default function ScraperTestPanel() {
  const [results, setResults] = useState<Record<string, ScraperTestResult>>({
    GOOGLE_PLACES: { isLoading: false, result: null, error: null },
    YELP: { isLoading: false, result: null, error: null },
    BBB: { isLoading: false, result: null, error: null },
    APOLLO: { isLoading: false, result: null, error: null }
  });

  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [limit, setLimit] = useState(5);

  const testScraper = async (source: string) => {
    setResults(prev => ({
      ...prev,
      [source]: { ...prev[source], isLoading: true, error: null }
    }));

    try {
      const response = await fetch(`/api/scrape/${source.toLowerCase()}/test`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, location, limit })
      });

      const data = await response.json();

      setResults(prev => ({
        ...prev,
        [source]: {
          isLoading: false,
          result: data,
          error: null
        }
      }));
    } catch (error) {
      setResults(prev => ({
        ...prev,
        [source]: {
          isLoading: false,
          result: null,
          error: error instanceof Error ? error.message : 'Test failed'
        }
      }));
    }
  };
// components/scrapers/scraper-test-panel.tsx
// Keep your existing code but update these style classes:

return (
  <Card className="bg-white shadow-md rounded-lg">
    <div className="p-6 border-b border-gray-200">
      <Text className="text-2xl font-bold text-gray-800 mb-6">Scraper Test Panel</Text>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search Query
          </label>
          <TextInput
            placeholder="Search query (e.g., restaurants)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Location
          </label>
          <TextInput
            placeholder="Location (e.g., New York, NY)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="bg-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Result Limit
          </label>
          <NumberInput
            placeholder="Result limit"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min={1}
            max={50}
            className="bg-white"
          />
        </div>
      </div>
    </div>

    <div className="p-6">
      <Grid numItems={1} className="gap-6">
        {Object.entries(SCRAPER_CONFIGS).map(([key, config]) => (
          <Card 
            key={key} 
            decoration="top" 
            decorationColor={config.enabled ? "blue" : "gray"}
            className="bg-gray-50 border border-gray-200"
          >
            {/* Rest of your card content with updated text colors */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div>
                <Text className="text-lg font-semibold text-gray-800">{config.name}</Text>
                <Text className="text-sm text-gray-600">
                  Cost per request: ${config.costPerRequest}
                </Text>
                <Text className="text-sm text-gray-600">
                  Rate limit: {config.rateLimit}
                </Text>
              </div>
              {/* ... rest of your existing code ... */}
            </div>
          </Card>
        ))}
      </Grid>
    </div>
  </Card>
);
}

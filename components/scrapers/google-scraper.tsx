// components/scrapers/google-scraper.tsx
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Text, Grid, Button, TextInput, NumberInput } from '@tremor/react';

interface GoogleScraperForm {
  query: string;
  location?: string;
  radius?: number;
  type?: string;
}

export default function GoogleScraper() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<GoogleScraperForm>();

  const onSubmit = async (data: GoogleScraperForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/scrape/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setResults(result.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-md rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Query
            </label>
            <TextInput
              {...register('query', { required: 'Query is required' })}
              placeholder="e.g., restaurants in New York"
              error={!!errors.query}
              errorMessage={errors.query?.message}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <TextInput
              {...register('location')}
              placeholder="e.g., New York, NY"
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Radius (meters)
            </label>
            <NumberInput
              {...register('radius', { min: 0, max: 50000 })}
              placeholder="Max 50000"
              min={0}
              max={50000}
              className="bg-white"
            />
          </div>

          <Button
            type="submit"
            loading={isLoading}
            loadingText="Scraping..."
            size="lg"
            color="blue"
            className="w-full mt-4"
          >
            Start Scraping
          </Button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <Text className="text-red-700">{error}</Text>
        </div>
      )}

      {results.length > 0 && (
        <div className="p-6 bg-gray-50">
          <Text className="text-xl font-semibold text-gray-800 mb-4">Results</Text>
          <Grid numItems={1} className="gap-4">
            {results.map((result: any, index: number) => (
              <Card key={index} className="p-4 bg-white border border-gray-200">
                <Text className="font-bold text-gray-800">{result.name}</Text>
                <Text className="text-gray-600">{result.address}</Text>
                {result.rating && (
                  <Text className="text-gray-600">Rating: {result.rating}</Text>
                )}
              </Card>
            ))}
          </Grid>
        </div>
      )}
    </Card>
  );
}
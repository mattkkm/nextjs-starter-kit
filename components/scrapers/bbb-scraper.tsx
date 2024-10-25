// components/scrapers/bbb-scraper.tsx
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Text, Grid, Button, TextInput, NumberInput } from '@tremor/react';

interface BBBScraperForm {
  businessName: string;
  location: string;
  page?: number;
}

export default function BBBScraper() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<BBBScraperForm>();

  const onSubmit = async (data: BBBScraperForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/scrape/bbb', {
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
        <Text className="text-xl font-semibold text-gray-800 mb-4">BBB Scraper</Text>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Business Name
            </label>
            <TextInput
              {...register('businessName', { required: 'Business name is required' })}
              placeholder="e.g., Acme Corporation"
              error={!!errors.businessName}
              errorMessage={errors.businessName?.message}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <TextInput
              {...register('location', { required: 'Location is required' })}
              placeholder="e.g., Los Angeles, CA"
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
            Start BBB Scraping
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
                  <div className="flex items-center gap-2">
                    <Text className="text-gray-600">Rating: {result.rating}</Text>
                    <Text className="text-gray-600">
                      Accredited: {result.isAccredited ? 'Yes' : 'No'}
                    </Text>
                  </div>
                )}
              </Card>
            ))}
          </Grid>
        </div>
      )}
    </Card>
  );
}
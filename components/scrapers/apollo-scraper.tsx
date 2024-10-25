// components/scrapers/apollo-scraper.tsx
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Text, Grid, Button, TextInput, NumberInput } from '@tremor/react';

interface ApolloScraperForm {
  companyName: string;
  domain?: string;
  industry?: string;
  limit?: number;
}

export default function ApolloScraper() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { register, handleSubmit, formState: { errors } } = useForm<ApolloScraperForm>();

  const onSubmit = async (data: ApolloScraperForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/scrape/apollo', {
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
        <Text className="text-xl font-semibold text-gray-800 mb-4">Apollo Scraper</Text>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name
            </label>
            <TextInput
              {...register('companyName', { required: 'Company name is required' })}
              placeholder="e.g., Tesla Inc"
              error={!!errors.companyName}
              errorMessage={errors.companyName?.message}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Domain (optional)
            </label>
            <TextInput
              {...register('domain')}
              placeholder="e.g., tesla.com"
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Industry (optional)
            </label>
            <TextInput
              {...register('industry')}
              placeholder="e.g., Automotive"
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result Limit
            </label>
            <NumberInput
              {...register('limit')}
              placeholder="Max results (default: 10)"
              min={1}
              max={50}
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
            Start Apollo Scraping
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
                <Text className="text-gray-600">{result.domain}</Text>
                <div className="flex flex-col gap-1 mt-2">
                  {result.industry && (
                    <Text className="text-gray-600">Industry: {result.industry}</Text>
                  )}
                  {result.employeeCount && (
                    <Text className="text-gray-600">
                      Employees: {result.employeeCount}
                    </Text>
                  )}
                  {result.revenue && (
                    <Text className="text-gray-600">
                      Revenue: ${result.revenue}
                    </Text>
                  )}
                </div>
              </Card>
            ))}
          </Grid>
        </div>
      )}
    </Card>
  );
}
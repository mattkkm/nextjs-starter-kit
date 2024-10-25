// components/scrapers/yelp-scraper.tsx
"use client"

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form'; // Add Controller
import { Card, Text, Grid, Button, TextInput, NumberInput, Select, SelectItem } from '@tremor/react';

interface YelpScraperForm {
  term: string;
  location: string;
  categories?: string;
  limit?: number;
}

const YELP_CATEGORIES = [
  { value: "restaurants", label: "Restaurants" },
  { value: "shopping", label: "Shopping" },
  { value: "homeservices", label: "Home Services" },
  { value: "beautysvc", label: "Beauty & Spas" },
  { value: "automotive", label: "Automotive" },
  { value: "professional", label: "Professional Services" }
];

export default function YelpScraper() {
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { control, register, handleSubmit, formState: { errors } } = useForm<YelpScraperForm>({
    defaultValues: {
      term: '',
      location: '',
      categories: '',
      limit: 20
    }
  });

  const onSubmit = async (data: YelpScraperForm) => {
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/scrape/yelp', {
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
        <Text className="text-xl font-semibold text-gray-800 mb-4">Yelp Scraper</Text>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Term
            </label>
            <TextInput
              {...register('term', { required: 'Search term is required' })}
              placeholder="e.g., pizza"
              error={!!errors.term}
              errorMessage={errors.term?.message}
              className="bg-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <TextInput
              {...register('location', { required: 'Location is required' })}
              placeholder="e.g., San Francisco, CA"
              className="bg-white"
            />
          </div>

          <div className="relative z-50"> {/* Add z-index to the category dropdown container */}
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Controller
              name="categories"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder="Select a category"
                  className="relative z-50" // Add z-index to the Select component
                >
                  {YELP_CATEGORIES.map((category) => (
                    <SelectItem 
                      key={category.value} 
                      value={category.value}
                      className="relative z-50" // Add z-index to each item
                    >
                      {category.label}
                    </SelectItem>
                  ))}
                </Select>
              )}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Result Limit
            </label>
            <Controller
              name="limit"
              control={control}
              render={({ field }) => (
                <NumberInput
                  {...field}
                  placeholder="Max results (default: 20)"
                  min={1}
                  max={50}
                  className="bg-white"
                />
              )}
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
            Start Yelp Scraping
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
                <Text className="text-gray-600">{result.location?.address1}</Text>
                {result.rating && (
                  <div className="flex items-center gap-2">
                    <Text className="text-gray-600">Rating: {result.rating}</Text>
                    <Text className="text-gray-600">Reviews: {result.review_count}</Text>
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
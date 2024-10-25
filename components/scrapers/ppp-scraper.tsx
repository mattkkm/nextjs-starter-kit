// components/scrapers/ppp-scraper.tsx
"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Card, Text, Grid, Button, TextInput, Metric, Badge, Divider } from '@tremor/react';

interface PPPScraperForm {
  companyName: string;
  state?: string;
  city?: string;
  zipCode?: string;
}

interface PPPLoanSummary {
  totalLoans: number;
  totalAmount: number;
  totalJobs: number;
  averageLoanAmount: number;
}

export default function PPPScraper() {
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState<PPPLoanSummary | null>(null);

  const { register, handleSubmit, formState: { errors } } = useForm<PPPScraperForm>();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const onSubmit = async (data: PPPScraperForm) => {
    setIsLoading(true);
    setError('');
    setSummary(null);
    
    try {
      const response = await fetch('/api/scrape/ppp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) throw new Error(result.error);

      setResults(result.results);
      setSummary(result.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to scrape data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="bg-white shadow-md rounded-lg">
      <div className="p-6 border-b border-gray-200">
        <Text className="text-xl font-semibold text-gray-800 mb-4">PPP Loan Data Scraper</Text>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company Name *
            </label>
            <TextInput
              {...register('companyName', { required: 'Company name is required' })}
              placeholder="e.g., Acme Corporation"
              error={!!errors.companyName}
              errorMessage={errors.companyName?.message}
              className="bg-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <TextInput
                {...register('state')}
                placeholder="e.g., CA"
                maxLength={2}
                className="bg-white uppercase"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <TextInput
                {...register('city')}
                placeholder="e.g., San Francisco"
                className="bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <TextInput
                {...register('zipCode')}
                placeholder="e.g., 94105"
                maxLength={5}
                className="bg-white"
              />
            </div>
          </div>

          <Button
            type="submit"
            size="lg"
            color="blue"
            className="w-full mt-4"
            disabled={isLoading}
            loading={isLoading}
          >
            {isLoading ? 'Searching PPP Data...' : 'Search PPP Loans'}
          </Button>
        </form>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <Text className="text-red-700">{error}</Text>
        </div>
      )}

      {summary && (
        <div className="p-6 bg-gray-50">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Summary</Text>
          <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-4">
            <Card decoration="top" decorationColor="blue">
              <Text className="text-sm">Total Loans</Text>
              <Metric>{summary.totalLoans}</Metric>
            </Card>
            <Card decoration="top" decorationColor="green">
              <Text className="text-sm">Total Amount</Text>
              <Metric>{formatCurrency(summary.totalAmount)}</Metric>
            </Card>
            <Card decoration="top" decorationColor="yellow">
              <Text className="text-sm">Jobs Retained</Text>
              <Metric>{summary.totalJobs.toLocaleString()}</Metric>
            </Card>
            <Card decoration="top" decorationColor="purple">
              <Text className="text-sm">Average Loan</Text>
              <Metric>{formatCurrency(summary.averageLoanAmount)}</Metric>
            </Card>
          </Grid>
        </div>
      )}

      {results.length > 0 && (
        <div className="p-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">Loan Details</Text>
          <div className="space-y-4">
            {results.map((loan, index) => (
              <Card key={index} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <Text className="font-bold">{loan.businessName}</Text>
                    <Text className="text-sm text-gray-600">
                      {loan.address.street}, {loan.address.city}, {loan.address.state} {loan.address.zip}
                    </Text>
                  </div>
                  <Badge color="green">
                    {formatCurrency(loan.loanAmount)}
                  </Badge>
                </div>
                <Divider />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                  <div>
                    <Text className="text-sm text-gray-600">Jobs Retained</Text>
                    <Text className="font-medium">{loan.jobsRetained}</Text>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600">Loan Date</Text>
                    <Text className="font-medium">
                      {new Date(loan.loanDate).toLocaleDateString()}
                    </Text>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600">Industry</Text>
                    <Text className="font-medium">{loan.industry.description}</Text>
                  </div>
                  <div>
                    <Text className="text-sm text-gray-600">Lender</Text>
                    <Text className="font-medium">{loan.lender}</Text>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
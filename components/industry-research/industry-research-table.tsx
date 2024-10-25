"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface IndustryResearch {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

export function IndustryResearchTable() {
  const queryClient = useQueryClient();

  const { data: industries, isLoading, error } = useQuery<IndustryResearch[]>({
    queryKey: ['industryResearch'],
    queryFn: async () => {
      const response = await fetch('/api/industry-research');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    },
  });

  const handleBeginScraping = async (industryId: string) => {
    console.log(`Beginning data scraping for industry ${industryId}`);
    // Implement scraping logic here
  };

  if (isLoading) return <div className="text-center py-4">Loading...</div>;
  if (error) return <div className="text-center py-4 text-red-500">An error occurred: {error.message}</div>;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[200px]">Name</TableHead>
          <TableHead className="max-w-[400px]">Description</TableHead>
          <TableHead className="w-[150px]">Created At</TableHead>
          <TableHead className="w-[150px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {industries?.map((industry) => (
          <TableRow key={industry.id}>
            <TableCell className="font-medium">{industry.name}</TableCell>
            <TableCell className="text-sm text-gray-500">{industry.description}</TableCell>
            <TableCell>{new Date(industry.createdAt).toLocaleDateString()}</TableCell>
            <TableCell>
              <Button 
                onClick={() => handleBeginScraping(industry.id)}
                variant="outline"
                size="sm"
              >
                Begin Data Scraping
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
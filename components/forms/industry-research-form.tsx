"use client";

import { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { industryResearchSchema, IndustryResearchFormValues } from '@/lib/validations/schema';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';


const placeholderData: IndustryResearchFormValues = {
  industryName: "Renewable Energy",
  description: "Companies involved in the production and distribution of clean, sustainable energy sources.",
  parameters: {
    size: "$1.5 trillion globally",
    geography: "Worldwide, with significant growth in Asia and Europe",
  },
  majorPlayers: "Tesla, Vestas, First Solar, Orsted, NextEra Energy",
};

export const IndustryResearchForm: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');
  const queryClient = useQueryClient();

  const { control, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<IndustryResearchFormValues>({
    resolver: zodResolver(industryResearchSchema),
    defaultValues: {
      industryName: '',
      description: '',
      parameters: {
        size: '',
        geography: '',
      },
      majorPlayers: '',
    },
  });

  const router = useRouter();

  const onSubmit = async (data: IndustryResearchFormValues) => {
    try {
      const formattedData = {
        ...data,
        majorPlayers: data.majorPlayers.split(',').map(player => player.trim()).filter(Boolean)
      };

      const response = await fetch('/api/industry-research', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit industry research');
      }

      // Invalidate and refetch the industryResearch query
      await queryClient.invalidateQueries(['industryResearch']);

      router.push('/dashboard/industry-research');
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsOpen(false);
      reset();
    }
  };
  // const onSubmit = async (data: IndustryResearchFormValues) => {
  //   try {
  //     const formattedData = {
  //       ...data,
  //       majorPlayers: data.majorPlayers.split(',').map(player => player.trim()).filter(Boolean)
  //     };

  //     const response = await fetch('/api/industry-research', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(formattedData),
  //     });

  //     if (!response.ok) {
  //       throw new Error('Failed to submit industry research');
  //     }

  //     router.push('/dashboard/industry-research');
  //     // router.push('/dashboard/data-scraping');
  //   } catch (error) {
  //     console.error('Error submitting form:', error);
  //   } finally {
  //     setIsOpen(false);
  //     reset();
  //   }
  // };

  const fillPlaceholderData = () => {
    reset(placeholderData);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          // className="bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          Start Research
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Industry Research</CardTitle>
            <CardDescription>
              Define industry parameters to begin research and analysis
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Tabs defaultValue="basic" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="parameters">Parameters</TabsTrigger>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="review">Review</TabsTrigger>
                </TabsList>

                <TabsContent value="basic" className="space-y-4">
                  <div className="space-y-4">
                    <Controller
                      name="industryName"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Industry Name</label>
                          <Input {...field} placeholder="e.g., Software as a Service (SaaS)" />
                          {errors.industryName && (
                            <p className="text-red-500 text-sm">{errors.industryName.message}</p>
                          )}
                        </div>
                      )}
                    />
                    <Controller
                      name="description"
                      control={control}
                      render={({ field }) => (
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea 
                            {...field} 
                            placeholder="Describe the industry and its key characteristics..."
                            className="min-h-[100px]"
                          />
                          {errors.description && (
                            <p className="text-red-500 text-sm">{errors.description.message}</p>
                          )}
                        </div>
                      )}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="parameters" className="space-y-4">
                  <Controller
                    name="parameters.size"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Market Size</label>
                        <Input {...field} placeholder="e.g., $50B annually" />
                        {errors.parameters?.size && (
                          <p className="text-red-500 text-sm">{errors.parameters.size.message}</p>
                        )}
                      </div>
                    )}
                  />
                  <Controller
                    name="parameters.geography"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Geographic Focus</label>
                        <Input {...field} placeholder="e.g., North America, Global" />
                        {errors.parameters?.geography && (
                          <p className="text-red-500 text-sm">{errors.parameters.geography.message}</p>
                        )}
                      </div>
                    )}
                  />
                </TabsContent>

                <TabsContent value="players" className="space-y-4">
                  <Controller
                    name="majorPlayers"
                    control={control}
                    render={({ field }) => (
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Major Players</label>
                        <Textarea 
                          {...field} 
                          placeholder="Enter major players, separated by commas..."
                          className="min-h-[100px]"
                        />
                        {errors.majorPlayers && (
                          <p className="text-red-500 text-sm">{errors.majorPlayers.message}</p>
                        )}
                      </div>
                    )}
                  />
                </TabsContent>

                <TabsContent value="review" className="space-y-4">
                  <div className="rounded-lg bg-gray-50 p-4 space-y-4">
                    <div>
                      <h4 className="font-medium">Industry Overview</h4>
                      <p className="text-sm text-gray-600">{watch('industryName')}</p>
                      <p className="text-sm text-gray-600">{watch('description')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Parameters</h4>
                      <p className="text-sm text-gray-600">Size: {watch('parameters.size')}</p>
                      <p className="text-sm text-gray-600">Geography: {watch('parameters.geography')}</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Major Players</h4>
                      <p className="text-sm text-gray-600">{watch('majorPlayers')}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between space-x-2 pt-4 border-t">
                <Button 
                  type="button"
                  variant="outline"
                  onClick={fillPlaceholderData}
                >
                  Fill Test Data
                </Button>
                <div>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsOpen(false)}
                    className="mr-2"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {isSubmitting ? 'Submitting...' : 'Start Research'}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
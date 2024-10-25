// app/dashboard/[workspaceId]/data-scraping/page.tsx
"use client";
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GoogleScraper from '@/components/scrapers/google-scraper';
import YelpScraper from '@/components/scrapers/yelp-scraper';
import BBBScraper from '@/components/scrapers/bbb-scraper';
import ApolloScraper from '@/components/scrapers/apollo-scraper';
import PPPScraper from '@/components/scrapers/ppp-scraper';  // Add this import
import ScraperTestPanel from '@/components/scrapers/scraper-test-panel';

export default function DataScraping() {
  return (
    <div className="flex flex-col p-8 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Data Scraping</h1>
        <p className="text-gray-600 mt-2">Manage and test various data scraping sources</p>
      </div>

      {/* <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Scraper Tests</h2>
        <ScraperTestPanel />
      </div> */}

      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Data Scrapers</h2>
        <Tabs defaultValue="google" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-4"> {/* Updated to 5 columns */}
            <TabsTrigger value="google">Google Places</TabsTrigger>
            <TabsTrigger value="yelp">Yelp</TabsTrigger>
            <TabsTrigger value="bbb">BBB</TabsTrigger>
            <TabsTrigger value="apollo">Apollo</TabsTrigger>
            <TabsTrigger value="ppp">PPP Data</TabsTrigger> {/* Added new tab */}
          </TabsList>
          
          <TabsContent value="google">
            <GoogleScraper />
          </TabsContent>
          
          <TabsContent value="yelp">
            <YelpScraper />
          </TabsContent>
          
          <TabsContent value="bbb">
            <BBBScraper />
          </TabsContent>
          
          <TabsContent value="apollo">
            <ApolloScraper />
          </TabsContent>

          <TabsContent value="ppp">
            <PPPScraper />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
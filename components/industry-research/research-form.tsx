// components/industry-research/research-form.tsx
"use client"

import { useState } from 'react';
import { Card, Title, Text, TabGroup, Tab, Button } from '@tremor/react';

export default function IndustryResearchForm() {
  const [activeTab, setActiveTab] = useState(0);
  
  const tabs = [
    { name: 'Basic Info', icon: 'InfoIcon' },
    { name: 'Market Structure', icon: 'ChartPieIcon' },
    { name: 'Financials', icon: 'CurrencyDollarIcon' },
    { name: 'Operations', icon: 'CogIcon' },
    { name: 'Growth & Risk', icon: 'TrendingUpIcon' },
    { name: 'Players', icon: 'UsersIcon' }
  ];

  return (
    <Card className="max-w-4xl mx-auto">
      <Title>Industry Research</Title>
      
      <TabGroup>
        {tabs.map((tab, idx) => (
          <Tab 
            key={tab.name}
            text={tab.name}
            icon={tab.icon}
            selected={activeTab === idx}
            onClick={() => setActiveTab(idx)}
          />
        ))}
      </TabGroup>

      <div className="mt-6">
        {activeTab === 0 && <BasicInfoForm />}
        {activeTab === 1 && <MarketStructureForm />}
        {/* ... other tab contents */}
      </div>

      <div className="mt-6 flex justify-between">
        <Button 
          disabled={activeTab === 0}
          onClick={() => setActiveTab(prev => prev - 1)}
        >
          Previous
        </Button>
        
        {activeTab === tabs.length - 1 ? (
          <Button onClick={handleSubmit}>
            Complete Research
          </Button>
        ) : (
          <Button onClick={() => setActiveTab(prev => prev + 1)}>
            Next
          </Button>
        )}
      </div>
    </Card>
  );
}
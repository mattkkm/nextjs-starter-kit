import { IndustryResearchForm } from '@/components/forms/industry-research-form';
import { IndustryResearchTable } from '@/components/industry-research/industry-research-table';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function IndustryResearchPage() {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Industry Research</h1>
        {/* <Button size="lg">Start Research</Button> */}
        <IndustryResearchForm />

      </div>
      <Card>
        <CardHeader>
          <CardTitle>Industry Research</CardTitle>
        </CardHeader>
        <CardContent>
          <IndustryResearchTable />
        </CardContent>
      </Card>
    </div>
  );
}
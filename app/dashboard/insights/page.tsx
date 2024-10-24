"use client";
import { useState } from 'react';

interface InsightsProps {}

const Insights: React.FC<InsightsProps> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleInsights = () => {
        setIsLoading(true);
        // Simulate an API call or data processing
        setTimeout(() => {
            setIsLoading(false);
            alert('Insights generation completed!');
        }, 2000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
            {isLoading ? (
                <div className="text-center">
                    <p className="text-lg font-semibold text-gray-700">Loading...</p>
                </div>
            ) : (
                <div className="p-6 bg-white rounded shadow-md">
                    <h1 className="text-2xl font-bold text-gray-800">Insights</h1>
                    <button
                        onClick={handleInsights}
                        className="mt-4 w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Generate Insights
                    </button>
                </div>
            )}
        </div>
    );
}

export default Insights;


"use client";
import { useState } from 'react';

interface IndustryResearchProps {}

export const IndustryResearch: React.FC<IndustryResearchProps> = () => {
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleResearch = () => {
        setIsLoading(true);
        // Simulate an API call or data processing
        setTimeout(() => {
            setIsLoading(false);
            alert('Industry research completed!');
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
                    <h1 className="text-2xl font-bold text-gray-800">Industry Research</h1>
                    <button
                        onClick={handleResearch}
                        className="mt-4 w-full px-4 py-2 font-semibold text-white bg-blue-500 rounded hover:bg-blue-600"
                    >
                        Start Research
                    </button>
                </div>
            )}
        </div>
    );
};

export default IndustryResearch;

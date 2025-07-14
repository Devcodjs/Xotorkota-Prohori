'use client';

import { useState } from 'react';
import { model } from '@/config/firebaseConfig'; // Adjust the import path

const SummarizePage = () => {
  const [rawReports, setRawReports] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSummarize = async () => {
    if (!rawReports.trim()) {
      setError('Please paste some flood reports to summarize.');
      setSummary(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setSummary(null); // Clear previous summary

    const prompt = `Summarize the following flood reports concisely, highlighting key affected areas, urgent needs, and any positive developments. Assume these are reports from various community members in Guwahati, Assam. Format the summary with bullet points for clarity:\n\n${rawReports}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setSummary(text);
    } catch (e: any) {
      console.error('Error generating summary:', e);
      setError('Error generating summary. Please try again.');
      setSummary(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Summarize Flood Reports</h1>

      <div className="mb-4">
        <label htmlFor="rawReports" className="block text-sm font-medium text-gray-700 mb-2">
          Paste Raw Flood Updates Here:
        </label>
        <textarea
          id="rawReports"
          rows={10}
          className="shadow-sm focus:ring-blue-500 focus:border-blue-500 mt-1 block w-full sm:text-sm border border-gray-300 rounded-md p-2"
          value={rawReports}
          onChange={(e) => setRawReports(e.target.value)}
          placeholder="e.g., 'Water level rising near XYZ area, urgent need for boats.' 'Road to PQR blocked due to landslide.'"
        ></textarea>
      </div>

      <button
        onClick={handleSummarize}
        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        disabled={isLoading}
      >
        {isLoading ? 'Generating Summary...' : 'Generate Summary'}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {summary && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded whitespace-pre-wrap">
          <h2 className="font-bold mb-2">Summary:</h2>
          {summary}
        </div>
      )}
    </div>
  );
};

export default SummarizePage;

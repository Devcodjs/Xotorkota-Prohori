"use client"

import React, { useState } from 'react';
import Head from 'next/head';
import { generateText } from '@/lib/model'; // Adjust path if aiService.js is elsewhere

export default function Home() {
  const [floodReports, setFloodReports] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateSummary = async () => {
    if (!floodReports.trim()) {
      setError('Please paste some flood reports to summarize.');
      return;
    }

    setLoading(true);
    setSummary('');
    setError('');

    const prompt = `Summarize the following flood reports concisely, highlighting key affected areas, urgent needs, and any positive developments. Assume these are reports from various community members in Guwahati, Assam. Format the summary with bullet points for clarity:\n\n${floodReports}`;

    try {
      const aiResponse = await generateText(prompt);
      if(aiResponse)setSummary(aiResponse);
    } catch (err) {
      console.error("Error generating summary:", err);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <Head>
        <title>Aapada Mitra: Flood Help</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="max-w-4xl w-full bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-8 rounded-md p-2 bg-blue-50">
         Aapada Mitra: Flood Help
        </h1>

        <p className="text-center text-gray-600 mb-8">
          Paste raw flood updates below, and our AI will generate a concise summary for community leaders and administrators.
        </p>

        <div className="mb-6">
          <label htmlFor="floodReports" className="block text-lg font-medium text-gray-700 mb-2">
            Paste Flood Reports Here:
          </label>
          <textarea
            id="floodReports"
            className="w-full p-4 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 h-48 resize-y shadow-sm"
            placeholder="E.g., 'Village A: Water level rising rapidly, need boats. Village B: Food supplies running low. Team X arrived at Village C, distributing aid.'"
            value={floodReports}
            onChange={(e) => setFloodReports(e.target.value)}
          ></textarea>
        </div>

        <button
          onClick={handleGenerateSummary}
          disabled={loading}
          className={`w-full px-6 py-3 text-lg font-semibold text-white rounded-lg shadow-md transition-all duration-300 ease-in-out
            ${loading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Summary...
            </div>
          ) : (
            'Generate Summary'
          )}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm">
            <p className="font-medium">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {summary && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">AI Generated Summary:</h2>
            <div className="p-5 bg-blue-50 border border-blue-200 rounded-lg shadow-inner text-gray-800 leading-relaxed whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


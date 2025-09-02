'use client';

import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { collection, onSnapshot, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth, model } from '@/config/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { ResourceRequest, ResourceOffer } from '@/types/resources';

interface FloodAlert {
  id: string;
  location: string;
  status: string;
  severity: string;
  timestamp: Timestamp;
  reportedBy: string;
}

const HomePage = () => {
  // Authentication states
  const [user, loadingAuth] = useAuthState(auth);
  const router = useRouter();

  // Summarizer states
  const [floodReports, setFloodReports] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Alerts states
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);

  // Resource states
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [resourceOffers, setResourceOffers] = useState<ResourceOffer[]>([]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loadingAuth && !user) {
      router.push('/login');
    }
  }, [user, loadingAuth, router]);

  // Fetch data
  useEffect(() => {
    if (user) {
      // Fetch Flood Alerts
      const alertsQuery = query(collection(db, 'floodAlerts'), orderBy('timestamp', 'desc'));
      const unsubscribeAlerts = onSnapshot(alertsQuery, (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<FloodAlert, 'id'>)
        })) as FloodAlert[];
        setAlerts(alertsData);
      });

      // Fetch Resource Requests
      const requestsQuery = query(collection(db, 'resourceRequests'), orderBy('timestamp', 'desc'));
      const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<ResourceRequest, 'id'>)
        })) as ResourceRequest[];
        setResourceRequests(requestsData);
      });

      // Fetch Resource Offers
      const offersQuery = query(collection(db, 'resourceOffers'), orderBy('timestamp', 'desc'));
      const unsubscribeOffers = onSnapshot(offersQuery, (snapshot) => {
        const offersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<ResourceOffer, 'id'>)
        })) as ResourceOffer[];
        setResourceOffers(offersData);
      });

      return () => {
        unsubscribeAlerts();
        unsubscribeRequests();
        unsubscribeOffers();
      };
    }
  }, [user]);

  const handleGenerateSummary = async () => {
    if (!floodReports.trim()) {
      setSummaryError('Please paste some flood reports to summarize.');
      setSummary(null);
      return;
    }

    setLoadingSummary(true);
    setSummaryError(null);
    setSummary(null);

    const prompt = `Summarize the following flood reports concisely, highlighting key affected areas, urgent needs, and any positive developments. Assume these are reports from various community members in Guwahati, Assam. Format the summary with bullet points for clarity:

${floodReports}`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setSummary(text);
    } catch (e: unknown) {
      console.error('Error generating summary:', e);
      setSummaryError('Error generating summary. Please try again.');
      setSummary(null);
    } finally {
      setLoadingSummary(false);
    }
  };

  if (loadingAuth) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading...</div>;
  }

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8 font-inter">
      <Head>
        <title>Xotorkota-Prohori: Community Dashboard</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="w-full max-w-7xl bg-white p-8 rounded-lg shadow-xl border border-gray-200">
        <h1 className="text-4xl font-bold text-center text-blue-700 mb-10 rounded-md p-2 bg-blue-50 shadow-md">
          Xotorkota-Prohori&apos;s: Community Dashboard
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Summarizer Section */}
          <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Flood Report Summarizer</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Paste raw flood updates, and our AI will generate a concise summary.
            </p>
            <div className="mb-4">
              <label htmlFor="floodReports" className="block text-sm font-medium text-gray-700 mb-2">
                Paste Flood Reports Here:
              </label>
              <textarea
                id="floodReports"
                rows={8}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-900 resize-y shadow-sm"
                placeholder="E.g., 'Village A: Water level rising rapidly, need boats. Village B: Food supplies running low. Team X arrived at Village C, distributing aid.'"
                value={floodReports}
                onChange={(e) => setFloodReports(e.target.value)}
              ></textarea>
            </div>
            <button
              onClick={handleGenerateSummary}
              disabled={loadingSummary}
              className={`w-full px-6 py-2 text-md font-semibold text-white rounded-lg shadow-md transition-all duration-300 ease-in-out
                ${loadingSummary ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'}`}
            >
              {loadingSummary ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Generating Summary...
                </div>
              ) : (
                'Generate Summary'
              )}
            </button>
            {summaryError && (
              <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-sm text-sm">
                <p className="font-medium">Error:</p>
                <p>{summaryError}</p>
              </div>
            )}
            {summary && (
              <div className="mt-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-3">AI Generated Summary:</h3>
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-inner text-gray-800 leading-relaxed whitespace-pre-wrap text-sm">
                  {summary}
                </div>
              </div>
            )}
          </section>

          {/* Alerts Section */}
          <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Current Flood Alerts</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Real-time updates on flood situations.
            </p>
            <div className="max-h-96 overflow-y-auto pr-2">
              {alerts.length === 0 ? (
                <p className="text-gray-500">No active flood alerts.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {alerts.map(alert => (
                    <div key={alert.id} className="border rounded-lg p-4 shadow-sm bg-blue-50 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-blue-700">{alert.location}</h3>
                      <p className="text-sm"><strong>Status:</strong> <span className={`font-medium ${alert.status === 'ongoing' ? 'text-red-600' : 'text-green-600'}`}>{alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</span></p>
                      <p className="text-sm"><strong>Severity:</strong> <span className={`font-medium ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-orange-500' : 'text-green-600'}`}>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Reported at: {new Date(alert.timestamp.toDate()).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Resource Requests Section */}
          <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resource Requests</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Community members&apos; needs for various resources.
            </p>
            <div className="max-h-96 overflow-y-auto pr-2">
              {resourceRequests.length === 0 ? (
                <p className="text-gray-500">No resource requests currently.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {resourceRequests.map(request => (
                    <div key={request.id} className="border rounded-lg p-4 shadow-sm bg-yellow-50 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-yellow-700">{request.item} <span className="text-gray-600">({request.quantity})</span></h3>
                      <p className="text-sm"><strong>Location:</strong> {request.location}</p>
                      <p className="text-sm"><strong>Urgency:</strong> <span className={`font-medium ${request.urgency === 'high' ? 'text-red-600' : request.urgency === 'medium' ? 'text-orange-500' : 'text-green-600'}`}>{request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Requested at: {new Date(request.timestamp.toDate()).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Resource Offers Section */}
          <section className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">Resource Offers</h2>
            <p className="text-gray-600 mb-4 text-sm">
              Available resources offered by community members.
            </p>
            <div className="max-h-96 overflow-y-auto pr-2">
              {resourceOffers.length === 0 ? (
                <p className="text-gray-500">No resource offers currently.</p>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {resourceOffers.map(offer => (
                    <div key={offer.id} className="border rounded-lg p-4 shadow-sm bg-green-50 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-green-700">{offer.item} <span className="text-gray-600">({offer.quantity})</span></h3>
                      <p className="text-sm"><strong>Location:</strong> {offer.location}</p>
                      <p className="text-sm"><strong>Availability:</strong> <span className={`font-medium ${offer.availability === 'immediate' ? 'text-green-600' : 'text-orange-500'}`}>{offer.availability.charAt(0).toUpperCase() + offer.availability.slice(1)}</span></p>
                      <p className="text-xs text-gray-500 mt-1">Offered at: {new Date(offer.timestamp.toDate()).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default HomePage;

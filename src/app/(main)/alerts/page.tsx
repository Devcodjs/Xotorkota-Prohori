'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig'; // Adjust the import path
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

interface FloodAlert {
  id: string;
  location: string;
  status: string;
  severity: string;
  timestamp: Timestamp;
  reportedBy: string;
}

const AlertsPage = () => {
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState('');
  const [severity, setSeverity] = useState('');
  const [user, loading] = useAuthState(auth);
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated after loading
    if (!loading && !user) {
      router.push('/login'); // Assuming you have a login page
    }

    if (user) {
      const q = query(collection(db, 'floodAlerts'), orderBy('timestamp', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const alertsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as any // Cast to any for simplicity, consider a more robust type assertion
        })) as FloodAlert[];
        setAlerts(alertsData);
      });

      return () => unsubscribe(); // Clean up the listener
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to report an alert.');
      return;
    }

    try {
      await addDoc(collection(db, 'floodAlerts'), {
        location,
        status,
        severity,
        timestamp: Timestamp.now(),
        reportedBy: user.uid,
      });
      setLocation('');
      setStatus('');
      setSeverity('');
      toast.success('Flood alert reported successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      toast.error('Error reporting flood alert. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading...</div>;
  }

  if (!user) {
    return null; // Or a message indicating redirection
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <Toaster /> {/* Add Toaster component here */}
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
        Flood Alerts
      </h1>

      <div className="flex flex-col md:flex-row w-full max-w-6xl gap-8">
        {/* Report Form */}
        <div className="w-full md:w-1/2 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">Report a New Flood Alert</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <input
              type="text"
              placeholder="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
              required
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
              required
            >
              <option value="">Select Status</option>
              <option value="observed">Observed</option>
              <option value="ongoing">Ongoing</option>
              <option value="resolved">Resolved</option>
            </select>
            <select
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
              required
            >
              <option value="">Select Severity</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <button
              type="submit"
              className="bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-200"
            >
              Report Alert
            </button>
          </form>
        </div>

        {/* Alerts List */}
        <div className="w-full md:w-1/2 p-6 bg-white rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-800 mb-5">Current and Past Alerts</h2>
          <div className="grid grid-cols-1 gap-6 max-h-[600px] overflow-y-auto pr-2">
            {alerts.length === 0 ? (
              <p className="text-gray-500 p-4 bg-gray-50 rounded-lg shadow-sm">No active flood alerts.</p>
            ) : (
              alerts.map(alert => (
                <div key={alert.id} className="bg-blue-50 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                  <h3 className="text-xl font-semibold text-blue-800 mb-2">{alert.location}</h3>
                  <p className="text-sm text-gray-700"><strong>Status:</strong> <span className={`font-medium ${alert.status === 'ongoing' ? 'text-red-600' : 'text-green-600'}`}>{alert.status.charAt(0).toUpperCase() + alert.status.slice(1)}</span></p>
                  <p className="text-sm text-gray-700"><strong>Severity:</strong> <span className={`font-medium ${alert.severity === 'high' ? 'text-red-600' : alert.severity === 'medium' ? 'text-orange-500' : 'text-green-600'}`}>{alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}</span></p>
                  <p className="text-xs text-gray-500 mt-2">Reported at: {new Date(alert.timestamp.toDate()).toLocaleString()}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;

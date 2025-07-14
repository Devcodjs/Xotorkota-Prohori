'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebaseConfig'; // Adjust the import path
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';

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
      alert('You must be logged in to report an alert.');
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
      alert('Flood alert reported successfully!');
    } catch (error) {
      console.error('Error adding document: ', error);
      alert('Error reporting flood alert. Please try again.');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  if (!user) {
    return null; // Or a message indicating redirection
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flood Alerts</h1>

      {/* Report Form */}
      <div className="mb-8 p-4 border rounded shadow-sm">
        <h2 className="text-xl font-semibold mb-4">Report a Flood Alert</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="p-2 border rounded"
            required
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="p-2 border rounded"
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
            className="p-2 border rounded"
            required
          >
            <option value="">Select Severity</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <button
            type="submit"
            className="md:col-span-3 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Report
          </button>
        </form>
      </div>

      {/* Alerts List */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Current Alerts</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map(alert => (
            <div key={alert.id} className="border rounded p-4 shadow-sm">
              <h3 className="text-lg font-semibold">{alert.location}</h3>
              <p><strong>Status:</strong> {alert.status}</p>
              <p><strong>Severity:</strong> {alert.severity}</p>
              <p className="text-sm text-gray-500">Reported at: {new Date(alert.timestamp.toDate()).toLocaleString()}</p>
              {/* You might want to display reportedBy in a more user-friendly way if you have user data */}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AlertsPage;

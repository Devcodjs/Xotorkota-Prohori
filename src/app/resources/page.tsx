'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth, model } from '@/config/firebaseConfig'; // Adjust the import path
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { ResourceRequest, ResourceOffer } from '@/types/resources'; // Import your types
import { generateText } from '@/lib/model';

const ResourcesPage = () => {
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [resourceOffers, setResourceOffers] = useState<ResourceOffer[]>([]);
  const [activeTab, setActiveTab] = useState<'needs' | 'offers'>('needs'); // State for tabs

  // State for request form
  const [requestItem, setRequestItem] = useState('');
  const [requestQuantity, setRequestQuantity] = useState<number>(1);
  const [requestLocation, setRequestLocation] = useState('');
  const [requestContact, setRequestContact] = useState('');
  const [requestUrgency, setRequestUrgency] = useState<'low' | 'medium' | 'high'>('low');

  // State for offer form
  const [offerItem, setOfferItem] = useState('');
  const [offerQuantity, setOfferQuantity] = useState<number>(1);
  const [offerLocation, setOfferLocation] = useState('');
  const [offerContact, setOfferContact] = useState('');
  const [offerAvailability, setOfferAvailability] = useState<'immediate' | 'within 24 hours' | 'within a week'>('immediate');

  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const [matchingResults, setMatchingResults] = useState<string | null>(null);
  const [isMatching, setIsMatching] = useState(false);

  useEffect(() => {
    // Redirect to login if not authenticated after loading
    if (!loading && !user) {
      router.push('/login'); // Assuming you have a login page
    }

    if (user) {
      // Listen for resource requests
      const requestsQuery = query(collection(db, 'resourceRequests'), orderBy('timestamp', 'desc'));
      const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as any // Cast to any for simplicity
        })) as ResourceRequest[];
        setResourceRequests(requestsData);
      });

      // Listen for resource offers
      const offersQuery = query(collection(db, 'resourceOffers'), orderBy('timestamp', 'desc'));
      const unsubscribeOffers = onSnapshot(offersQuery, (snapshot) => {
        const offersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data() as any // Cast to any for simplicity
        })) as ResourceOffer[];
        setResourceOffers(offersData);
      });

      return () => {
        unsubscribeRequests();
        unsubscribeOffers();
      }; // Clean up listeners
    }
  }, [user, loading, router]);

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to submit a request.');
      return;
    }

    try {
      await addDoc(collection(db, 'resourceRequests'), {
        item: requestItem,
        quantity: requestQuantity,
        location: requestLocation,
        contact: requestContact,
        urgency: requestUrgency,
        status: 'pending',
        timestamp: Timestamp.now(),
        userId: user.uid,
      });
      // Clear form
      setRequestItem('');
      setRequestQuantity(1);
      setRequestLocation('');
      setRequestContact('');
      setRequestUrgency('low');
      alert('Resource request submitted successfully!');
    } catch (error) {
      console.error('Error adding resource request: ', error);
      alert('Error submitting resource request. Please try again.');
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      alert('You must be logged in to submit an offer.');
      return;
    }

    try {
      await addDoc(collection(db, 'resourceOffers'), {
        item: offerItem,
        quantity: offerQuantity,
        location: offerLocation,
        contact: offerContact,
        availability: offerAvailability,
        status: 'pending',
        timestamp: Timestamp.now(),
        userId: user.uid,
      });
      // Clear form
      setOfferItem('');
      setOfferQuantity(1);
      setOfferLocation('');
      setOfferContact('');
      setOfferAvailability('immediate');
      alert('Resource offer submitted successfully!');
    } catch (error) {
      console.error('Error adding resource offer: ', error);
      alert('Error submitting resource offer. Please try again.');
    }
  };

  const handleMatchOffers = async (request: ResourceRequest) => {
    setIsMatching(true);
    setMatchingResults(null); // Clear previous results

    const offersList = resourceOffers.map(offer =>
      `- Item: ${offer.item}, Quantity: ${offer.quantity}, Location: ${offer.location}, Availability: ${offer.availability}`
    ).join('\n');

    const prompt = `I am requesting '${request.item}' with a quantity of ${request.quantity} at location '${request.location}'. Here are the current resource offers:\n\n${offersList}\n\nWhich offers are most relevant to my request? Summarize the top 3 most relevant offers and explain why they are a good match. Please format the response clearly.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      setMatchingResults(text);
    } catch (e) {
      console.error('Error generating AI match:', e);
      setMatchingResults('Error generating match. Please try again.');
    } finally {
      setIsMatching(false);
    }
  };

  const handleMatchRequests = async (offer: ResourceOffer) => {
    setIsMatching(true);
    setMatchingResults(null); // Clear previous results

    const requestsList = resourceRequests.map(request =>
      `- Item: ${request.item}, Quantity: ${request.quantity}, Location: ${request.location}, Urgency: ${request.urgency}`
    ).join('\n');

    const prompt = `I am offering '${offer.item}' with a quantity of ${offer.quantity} at location '${offer.location}'. Here are the current resource requests:\n\n${requestsList}\n\nWhich requests are most relevant to my offer? Summarize the top 3 most relevant requests and explain why they are a good match. Please format the response clearly.`;

    try {
      const text = await generateText(prompt)
      if(text)setMatchingResults(text);
    } catch (e) {
      console.error('Error generating AI match:', e);
      setMatchingResults('Error generating match. Please try again.');
    } finally {
      setIsMatching(false);
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
      <h1 className="text-2xl font-bold mb-4">Resource Exchange</h1>

      {/* Tabs */}
      <div className="mb-4 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'needs' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('needs')}
          >
            Needs
          </button>
          <button
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'offers' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
            onClick={() => setActiveTab('offers')}
          >
            Offers
          </button>
        </nav>
      </div>

      {/* Matching Results Display */}
      {matchingResults && (
        <div className="mb-8 p-4 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          <h2 className="font-bold mb-2">AI Matching Results:</h2>
          <pre className="whitespace-pre-wrap">{matchingResults}</pre>
          <button
            className="mt-4 bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600"
            onClick={() => setMatchingResults(null)}
          >
            Clear Results
          </button>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'needs' && (
        <div>
          {/* Submit Resource Request Form */}
          <div className="mb-8 p-4 border rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Submit a Resource Request</h2>
            <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item (e.g., Water, Medical Supplies)"
                value={requestItem}
                onChange={(e) => setRequestItem(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={requestQuantity}
                onChange={(e) => setRequestQuantity(parseInt(e.target.value))}
                className="p-2 border rounded"
                min="1"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g., Specific Address, Area)"
                value={requestLocation}
                onChange={(e) => setRequestLocation(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Contact Information"
                value={requestContact}
                onChange={(e) => setRequestContact(e.target.value)}
                className="p-2 border rounded"
                required
              />
               <select
                value={requestUrgency}
                onChange={(e) => setRequestUrgency(e.target.value as 'low' | 'medium' | 'high')}
                className="p-2 border rounded"
                required
              >
                <option value="low">Low Urgency</option>
                <option value="medium">Medium Urgency</option>
                <option value="high">High Urgency</option>
              </select>
              <button
                type="submit"
                className="md:col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* List of Resource Requests */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Resource Needs</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resourceRequests.map(request => (
                <div key={request.id} className="border rounded p-4 shadow-sm">
                  <h3 className="text-lg font-semibold">{request.item} ({request.quantity})</h3>
                  <p><strong>Location:</strong> {request.location}</p>
                  <p><strong>Contact:</strong> {request.contact}</p>
                  <p><strong>Urgency:</strong> {request.urgency}</p>
                  <p className="text-sm text-gray-500">Requested at: {new Date(request.timestamp.toDate()).toLocaleString()}</p>
                   <button
                     className="mt-2 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
                     onClick={() => handleMatchOffers(request)}
                     disabled={isMatching}
                   >
                     {isMatching ? 'Matching...' : 'Match Offers'}
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'offers' && (
        <div>
           {/* Submit Resource Offer Form */}
          <div className="mb-8 p-4 border rounded shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Submit a Resource Offer</h2>
            <form onSubmit={handleOfferSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Item (e.g., Water, Medical Supplies)"
                value={offerItem}
                onChange={(e) => setOfferItem(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                type="number"
                placeholder="Quantity"
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(parseInt(e.target.value))}
                className="p-2 border rounded"
                min="1"
                required
              />
              <input
                type="text"
                placeholder="Location (e.g., Specific Address, Area)"
                value={offerLocation}
                onChange={(e) => setOfferLocation(e.target.value)}
                className="p-2 border rounded"
                required
              />
              <input
                type="text"
                placeholder="Contact Information"
                value={offerContact}
                onChange={(e) => setOfferContact(e.target.value)}
                className="p-2 border rounded"
                required
              />
               <select
                value={offerAvailability}
                onChange={(e) => setOfferAvailability(e.target.value as 'immediate' | 'within 24 hours' | 'within a week')}
                className="p-2 border rounded"
                required
              >
                <option value="immediate">Immediate</option>
                <option value="within 24 hours">Within 24 Hours</option>
                <option value="within a week">Within a Week</option>
              </select>
              <button
                type="submit"
                className="md:col-span-2 bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              >
                Submit Offer
              </button>
            </form>
          </div>

          {/* List of Resource Offers */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Current Resource Offers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {resourceOffers.map(offer => (
                <div key={offer.id} className="border rounded p-4 shadow-sm">
                  <h3 className="text-lg font-semibold">{offer.item} ({offer.quantity})</h3>
                  <p><strong>Location:</strong> {offer.location}</p>
                  <p><strong>Contact:</strong> {offer.contact}</p>
                  <p><strong>Availability:</strong> {offer.availability}</p>
                  <p className="text-sm text-gray-500">Offered at: {new Date(offer.timestamp.toDate()).toLocaleString()}</p>
                   <button
                     className="mt-2 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:opacity-50"
                     onClick={() => handleMatchRequests(offer)}
                     disabled={isMatching}
                   >
                     {isMatching ? 'Matching...' : 'Match Requests'}
                   </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcesPage;

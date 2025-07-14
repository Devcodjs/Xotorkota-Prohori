'use client';

import { useEffect, useState } from 'react';
import { collection, onSnapshot, addDoc, query, orderBy, Timestamp } from 'firebase/firestore';
import { db, auth, model } from '@/config/firebaseConfig';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useRouter } from 'next/navigation';
import { ResourceRequest, ResourceOffer } from '@/types/resources';
import { generateText } from '@/lib/model';
import toast, { Toaster } from 'react-hot-toast'; // Import react-hot-toast

const ResourcesPage = () => {
  const [resourceRequests, setResourceRequests] = useState<ResourceRequest[]>([]);
  const [resourceOffers, setResourceOffers] = useState<ResourceOffer[]>([]);
  const [activeTab, setActiveTab] = useState<'needs' | 'offers'>('needs');

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
    if (!loading && !user) {
      router.push('/login');
    }

    if (user) {
      const requestsQuery = query(collection(db, 'resourceRequests'), orderBy('timestamp', 'desc'));
      const unsubscribeRequests = onSnapshot(requestsQuery, (snapshot) => {
        const requestsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        })) as ResourceRequest[];
        setResourceRequests(requestsData);
      });

      const offersQuery = query(collection(db, 'resourceOffers'), orderBy('timestamp', 'desc'));
      const unsubscribeOffers = onSnapshot(offersQuery, (snapshot) => {
        const offersData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as any)
        })) as ResourceOffer[];
        setResourceOffers(offersData);
      });

      return () => {
        unsubscribeRequests();
        unsubscribeOffers();
      };
    }
  }, [user, loading, router]);

  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a request.');
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
      setRequestItem('');
      setRequestQuantity(1);
      setRequestLocation('');
      setRequestContact('');
      setRequestUrgency('low');
      toast.success('Resource request submitted successfully!');
    } catch (error) {
      console.error('Error adding resource request: ', error);
      toast.error('Error submitting resource request. Please try again.');
    }
  };

  const handleOfferSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit an offer.');
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
      setOfferItem('');
      setOfferQuantity(1);
      setOfferLocation('');
      setOfferContact('');
      setOfferAvailability('immediate');
      toast.success('Resource offer submitted successfully!');
    } catch (error) {
      console.error('Error adding resource offer: ', error);
      toast.error('Error submitting resource offer. Please try again.');
    }
  };

  const handleMatchOffers = async (request: ResourceRequest) => {
    setIsMatching(true);
    setMatchingResults(null);

    const offersList = resourceOffers.map(offer =>
      `- Item: ${offer.item}, Quantity: ${offer.quantity}, Location: ${offer.location}, Availability: ${offer.availability}`
    ).join('')

    const prompt = `I am requesting '${request.item}' with a quantity of ${request.quantity} at location '${request.location}'. Here are the current resource offers:

${offersList}

Which offers are most relevant to my request? Summarize the top 3 most relevant offers and explain why they are a good match. Please format the response clearly.`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      toast.success('Matching results generated!');
      setMatchingResults(text);
    } catch (e) {
      console.error('Error generating AI match:', e);
      toast.error('Error generating match. Please try again.');
      setMatchingResults(null);
    } finally {
      setIsMatching(false);
    }
  };

  const handleMatchRequests = async (offer: ResourceOffer) => {
    setIsMatching(true);
    setMatchingResults(null);

    const requestsList = resourceRequests.map(request =>
      `- Item: ${request.item}, Quantity: ${request.quantity}, Location: ${request.location}, Urgency: ${request.urgency}`
    ).join('')

    const prompt = `I am offering '${offer.item}' with a quantity of ${offer.quantity} at location '${offer.location}'. Here are the current resource requests:

${requestsList}

Which requests are most relevant to my offer? Summarize the top 3 most relevant requests and explain why they are a good match. Please format the response clearly.`;

    try {
      const text = await generateText(prompt)
      if(text) {
        toast.success('Matching results generated!');
        setMatchingResults(text);
      }
    } catch (e) {
      console.error('Error generating AI match:', e);
      toast.error('Error generating match. Please try again.');
      setMatchingResults(null);
    } finally {
      setIsMatching(false);
    }
  };


  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl font-semibold">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center py-10 px-4 sm:px-6 lg:px-8">
      <Toaster /> {/* Add Toaster component here */}
      <h1 className="text-4xl font-bold text-center text-blue-700 mb-8">
        Resource Exchange
      </h1>

      <div className="w-full max-w-4xl bg-white p-8 rounded-lg shadow-xl">
        {/* Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-md">
          <nav className="flex space-x-2 p-2">
            <button
              className={`flex-1 py-3 px-4 text-center font-medium text-lg rounded-md transition-colors duration-200
                ${activeTab === 'needs' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('needs')}
            >
              Resource Needs
            </button>
            <button
              className={`flex-1 py-3 px-4 text-center font-medium text-lg rounded-md transition-colors duration-200
                ${activeTab === 'offers' ? 'bg-blue-600 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}
              onClick={() => setActiveTab('offers')}
            >
              Resource Offers
            </button>
          </nav>
        </div>

        {/* Matching Results Display */}
        {matchingResults && (
          <div className="mb-8 p-6 bg-yellow-100 text-yellow-700 rounded-lg shadow-md">
            <h2 className="font-bold text-xl mb-3">AI Matching Results:</h2>
            <pre className="whitespace-pre-wrap text-sm leading-relaxed">{matchingResults}</pre>
            <button
              className="mt-4 bg-yellow-600 text-white p-2 rounded-md hover:bg-yellow-700 shadow-sm"
              onClick={() => setMatchingResults(null)}
            >
              Clear Results
            </button>
          </div>
        )}

        {/* Content based on active tab */}
        <div className="w-full">
          {activeTab === 'needs' && (
            <div className="space-y-8">
              {/* Submit Resource Request Form */}
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-5">Submit a Resource Request</h2>
                <form onSubmit={handleRequestSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Item (e.g., Water, Medical Supplies)"
                    value={requestItem}
                    onChange={(e) => setRequestItem(e.target.value)}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={requestQuantity}
                    onChange={(e) => setRequestQuantity(parseInt(e.target.value))}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    min="1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g., Specific Address, Area)"
                    value={requestLocation}
                    onChange={(e) => setRequestLocation(e.target.value)}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contact Information"
                    value={requestContact}
                    onChange={(e) => setRequestContact(e.target.value)}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  />
                   <select
                    value={requestUrgency}
                    onChange={(e) => setRequestUrgency(e.target.value as 'low' | 'medium' | 'high')}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  >
                    <option value="low">Low Urgency</option>
                    <option value="medium">Medium Urgency</option>
                    <option value="high">High Urgency</option>
                  </select>
                  <button
                    type="submit"
                    className="md:col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-200"
                  >
                    Submit Request
                  </button>
                </form>
              </div>

              {/* List of Resource Requests */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-5">Current Resource Needs</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resourceRequests.length === 0 ? (
                    <p className="text-gray-500 p-4 bg-white rounded-lg shadow-md">No resource requests currently.</p>
                  ) : (
                    resourceRequests.map(request => (
                      <div key={request.id} className="bg-yellow-50 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <h3 className="text-xl font-semibold text-yellow-800 mb-2">{request.item} <span className="text-gray-600 font-normal">({request.quantity})</span></h3>
                        <p className="text-sm text-gray-700"><strong>Location:</strong> {request.location}</p>
                        <p className="text-sm text-gray-700"><strong>Contact:</strong> {request.contact}</p>
                        <p className="text-sm text-gray-700"><strong>Urgency:</strong> <span className={`font-medium ${request.urgency === 'high' ? 'text-red-600' : request.urgency === 'medium' ? 'text-orange-500' : 'text-green-600'}`}>{request.urgency.charAt(0).toUpperCase() + request.urgency.slice(1)}</span></p>
                        <p className="text-xs text-gray-500 mt-2">Requested at: {new Date(request.timestamp.toDate()).toLocaleString()}</p>
                         <button
                           className="mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all duration-200"
                           onClick={() => handleMatchOffers(request)}
                           disabled={isMatching}
                         >
                           {isMatching ? 'Matching...' : 'Match Offers'}
                         </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'offers' && (
            <div className="space-y-8">
               {/* Submit Resource Offer Form */}
              <div className="p-6 bg-white rounded-lg shadow-lg">
                <h2 className="text-2xl font-semibold text-gray-800 mb-5">Submit a Resource Offer</h2>
                <form onSubmit={handleOfferSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input
                    type="text"
                    placeholder="Item (e.g., Water, Medical Supplies)"
                    value={offerItem}
                    onChange={(e) => setOfferItem(e.target.value)}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={offerQuantity}
                    onChange={(e) => setOfferQuantity(parseInt(e.target.value))}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    min="1"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Location (e.g., Specific Address, Area)"
                    value={offerLocation}
                    onChange={(e) => setOfferLocation(e.target.value)}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Contact Information"
                    value={offerContact}
                    onChange={(e) => setOfferContact(e.target.value)}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  />
                   <select
                    value={offerAvailability}
                    onChange={(e) => setOfferAvailability(e.target.value as 'immediate' | 'within 24 hours' | 'within a week')}
                    className="p-3 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 border border-gray-300"
                    required
                  >
                    <option value="immediate">Immediate</option>
                    <option value="within 24 hours">Within 24 Hours</option>
                    <option value="within a week">Within a Week</option>
                  </select>
                  <button
                    type="submit"
                    className="md:col-span-2 bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 shadow-md transition-all duration-200"
                  >
                    Submit Offer
                  </button>
                </form>
              </div>

              {/* List of Resource Offers */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-800 mb-5">Current Resource Offers</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {resourceOffers.length === 0 ? (
                    <p className="text-gray-500 p-4 bg-white rounded-lg shadow-md">No resource offers currently.</p>
                  ) : (
                    resourceOffers.map(offer => (
                      <div key={offer.id} className="bg-green-50 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow duration-300">
                        <h3 className="text-xl font-semibold text-green-800 mb-2">{offer.item} <span className="text-gray-600 font-normal">({offer.quantity})</span></h3>
                        <p className="text-sm text-gray-700"><strong>Location:</strong> {offer.location}</p>
                        <p className="text-sm text-gray-700"><strong>Contact:</strong> {offer.contact}</p>
                        <p className="text-sm text-gray-700"><strong>Availability:</strong> <span className={`font-medium ${offer.availability === 'immediate' ? 'text-green-600' : 'text-orange-500'}`}>{offer.availability.charAt(0).toUpperCase() + offer.availability.slice(1)}</span></p>
                        <p className="text-xs text-gray-500 mt-2">Offered at: {new Date(offer.timestamp.toDate()).toLocaleString()}</p>
                         <button
                           className="mt-4 bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 disabled:opacity-50 shadow-sm transition-all duration-200"
                           onClick={() => handleMatchRequests(offer)}
                           disabled={isMatching}
                         >
                           {isMatching ? 'Matching...' : 'Match Requests'}
                         </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResourcesPage;

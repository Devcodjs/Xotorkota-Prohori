// src/types/resources.ts

import { Timestamp } from 'firebase/firestore';

export interface ResourceItem {
  id: string;
  item: string;
  quantity: number;
  location: string;
  contact: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  timestamp: Timestamp;
  userId: string; // User who made the request/offer
}

export interface ResourceRequest extends ResourceItem {
  urgency: 'low' | 'medium' | 'high';
}

export interface ResourceOffer extends ResourceItem {
  availability: 'immediate' | 'within 24 hours' | 'within a week';
}

import { type Timestamp } from 'firebase/firestore';

export interface Company {
  id: string;
  name: string;
  contactName?: string;
  phone?: string;
  telegramAlias?: string;
  notes?: string;
  banList: string[];
  createdAt: Timestamp | null;
  createdBy: string;
  updatedAt: Timestamp | null;
  updatedBy?: string;
}

export interface CompanyInput {
  name: string;
  contactName?: string;
  phone?: string;
  telegramAlias?: string;
  notes?: string;
}

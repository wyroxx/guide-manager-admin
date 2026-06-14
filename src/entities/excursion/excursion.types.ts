import { type Timestamp } from 'firebase/firestore';
import { type GuideLevel } from '../guide/guide.types';

export const PAYMENT_STATUSES = ['paid', 'unpaid'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  paid: 'Оплачено',
  unpaid: 'Не оплачено',
};

export interface Excursion {
  id: string;
  title: string;
  startDate: Timestamp | null;
  endDate: Timestamp | null;
  route: string;
  meetingPlace: string;
  companyId: string;
  companyName: string;
  requiredGuides: number;
  requiredLevels: GuideLevel[];
  maxParticipants: number;
  hasSpots: boolean;
  hasLunch: boolean;
  hasMasterclass: boolean;
  excursionType: string;
  paymentStatus: PaymentStatus;
  assignedGuides: string[];
  createdAt: Timestamp | null;
  createdBy: string;
  updatedAt: Timestamp | null;
  updatedBy?: string;
}

export interface ExcursionInput {
  title: string;
  startDate: Date;
  endDate: Date;
  route: string;
  meetingPlace: string;
  companyId: string;
  requiredGuides: number;
  requiredLevels: GuideLevel[];
  maxParticipants: number;
  hasLunch: boolean;
  hasMasterclass: boolean;
  excursionType: string;
  paymentStatus: PaymentStatus;
}

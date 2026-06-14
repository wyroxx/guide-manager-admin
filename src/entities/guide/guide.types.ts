import { type Timestamp } from 'firebase/firestore';

export const GUIDE_LEVELS = ['trainee', 'junior', 'middle', 'senior'] as const;

export type GuideLevel = (typeof GUIDE_LEVELS)[number];

export const GUIDE_LEVEL_LABELS: Record<GuideLevel, string> = {
  trainee: 'Стажёр',
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
};

export interface Guide {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  telegramAlias?: string;
  level: GuideLevel;
  toursCount: number;
  createdAt: Timestamp | null;
  createdBy: string;
  updatedAt: Timestamp | null;
  updatedBy?: string;
}

export interface GuideInput {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  telegramAlias?: string;
  level: GuideLevel;
}

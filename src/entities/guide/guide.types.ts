import { type Timestamp } from 'firebase/firestore';

export const GUIDE_LEVELS = ['trainee', 'junior', 'middle', 'senior'] as const;

export type GuideLevel = (typeof GUIDE_LEVELS)[number];
export type GuideLevelValue = GuideLevel | '';

export const GUIDE_LEVEL_LABELS: Record<GuideLevelValue, string> = {
  '': 'Не назначен',
  trainee: 'Стажёр',
  junior: 'Junior',
  middle: 'Middle',
  senior: 'Senior',
};

export function isGuideLevel(value: unknown): value is GuideLevel {
  return GUIDE_LEVELS.includes(value as GuideLevel);
}

export interface Guide {
  uid: string;
  email: string;
  name: string;
  phone?: string;
  telegramAlias?: string;
  level: GuideLevelValue;
  isApproved: boolean;
  toursCount: number;
  createdAt: Timestamp | null;
  createdBy: string;
  updatedAt: Timestamp | null;
  updatedBy?: string;
}

export interface GuideInput {
  email: string;
  name: string;
  phone?: string;
  telegramAlias?: string;
  level: GuideLevel;
}

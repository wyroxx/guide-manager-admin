import { type Timestamp } from 'firebase/firestore';

export const APPLICATION_STATUSES = ['pending', 'accepted', 'rejected'] as const;
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: 'Ожидает решения',
  accepted: 'Принята',
  rejected: 'Отклонена',
};

export interface Application {
  id: string;
  excursionId: string;
  excursionTitle: string;
  excursionStartDate: Timestamp | null;
  excursionMaxParticipants: number;
  guideUid: string;
  guideName: string;
  guideEmail: string;
  status: ApplicationStatus;
  createdAt: Timestamp | null;
  decidedAt: Timestamp | null;
  decidedBy?: string;
  decisionComment?: string;
}

export interface ApplicationDecisionInput {
  applicationId: string;
  excursionId: string;
  comment?: string;
}

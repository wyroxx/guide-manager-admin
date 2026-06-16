import {
  Timestamp,
  collection,
  collectionGroup,
  deleteField,
  doc,
  getDocs,
  runTransaction,
  serverTimestamp,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase/client';
import {
  type Application,
  type ApplicationDecisionInput,
  type ApplicationStatus,
} from './application.types';
import { validateApplicationAcceptance } from './application.logic';

export const applicationKeys = {
  all: ['applications'] as const,
  byExcursion: (excursionId: string) => ['applications', 'excursion', excursionId] as const,
};

function applicationStatus(value: unknown): ApplicationStatus {
  if (value === 'accepted' || value === 'rejected') return value;
  return 'pending';
}

function applicationFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>): Application {
  const data = snapshot.data();
  const parentExcursionId = snapshot.ref.parent.parent?.id ?? '';

  return {
    id: snapshot.id,
    excursionId: data.excursionId ?? parentExcursionId,
    excursionTitle: data.excursionTitle ?? '',
    excursionStartDate: data.excursionStartDate instanceof Timestamp
      ? data.excursionStartDate
      : null,
    excursionMaxParticipants: typeof data.excursionMaxParticipants === 'number'
      ? data.excursionMaxParticipants
      : 0,
    guideUid: data.guideUid ?? snapshot.id,
    guideName: data.guideName ?? '',
    guideEmail: data.guideEmail ?? '',
    status: applicationStatus(data.status),
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
    decidedAt: data.decidedAt instanceof Timestamp ? data.decidedAt : null,
    decidedBy: data.decidedBy,
    decisionComment: data.decisionComment,
  };
}

function sortApplications(applications: Application[]) {
  return applications.sort((left, right) => {
    if (left.status === 'pending' && right.status !== 'pending') return -1;
    if (left.status !== 'pending' && right.status === 'pending') return 1;
    return (right.createdAt?.toMillis() ?? 0) - (left.createdAt?.toMillis() ?? 0);
  });
}

export async function listApplications() {
  const snapshot = await getDocs(collectionGroup(db, 'applications'));
  return sortApplications(snapshot.docs.map(applicationFromSnapshot));
}

export async function listApplicationsForExcursion(excursionId: string) {
  const snapshot = await getDocs(collection(db, 'excursions', excursionId, 'applications'));
  return sortApplications(snapshot.docs.map(applicationFromSnapshot));
}

function commentValue(comment: string | undefined) {
  const trimmed = comment?.trim();
  return trimmed ? trimmed : deleteField();
}

export async function acceptApplication(
  input: ApplicationDecisionInput,
  actorUid: string,
) {
  const applicationRef = doc(
    db,
    'excursions',
    input.excursionId,
    'applications',
    input.applicationId,
  );
  const excursionRef = doc(db, 'excursions', input.excursionId);

  await runTransaction(db, async (transaction) => {
    const applicationSnapshot = await transaction.get(applicationRef);
    const excursionSnapshot = await transaction.get(excursionRef);

    if (!applicationSnapshot.exists()) throw new Error('Заявка не найдена.');
    if (!excursionSnapshot.exists()) throw new Error('Экскурсия не найдена.');

    const application = applicationSnapshot.data();
    const excursion = excursionSnapshot.data();
    const guideUid = typeof application.guideUid === 'string'
      ? application.guideUid
      : applicationSnapshot.id;
    const guideRef = doc(db, 'guides', guideUid);
    const companyId = excursion.companyId;
    if (typeof companyId !== 'string' || !companyId) {
      throw new Error('У экскурсии не указана компания.');
    }
    const companyRef = doc(db, 'companies', companyId);
    const guideSnapshot = await transaction.get(guideRef);
    const companySnapshot = await transaction.get(companyRef);

    if (!guideSnapshot.exists()) throw new Error('Гид больше не существует в коллекции guides.');
    if (!companySnapshot.exists()) throw new Error('Компания экскурсии не найдена.');

    const guide = guideSnapshot.data();
    if (guide.isApproved !== true) {
      throw new Error('Сначала одобрите гида.');
    }
    const company = companySnapshot.data();
    const decision = validateApplicationAcceptance({
      applicationStatus: application.status,
      applicationEmail: application.guideEmail,
      assignedGuides: excursion.assignedGuides,
      banList: company.banList,
      guideEmail: guide.email,
      guideLevel: guide.level,
      requiredGuides: excursion.requiredGuides,
      requiredLevels: excursion.requiredLevels,
    });
    transaction.update(applicationRef, {
      status: 'accepted',
      decidedAt: serverTimestamp(),
      decidedBy: actorUid,
      decisionComment: commentValue(input.comment),
    });
    transaction.update(excursionRef, {
      companyName: company.name,
      assignedGuides: decision.nextAssignedGuides,
      hasSpots: decision.hasSpots,
      updatedAt: serverTimestamp(),
      updatedBy: actorUid,
    });
  });
}

export async function rejectApplication(
  input: ApplicationDecisionInput,
  actorUid: string,
) {
  const applicationRef = doc(
    db,
    'excursions',
    input.excursionId,
    'applications',
    input.applicationId,
  );

  await runTransaction(db, async (transaction) => {
    const applicationSnapshot = await transaction.get(applicationRef);
    if (!applicationSnapshot.exists()) throw new Error('Заявка не найдена.');
    if (applicationSnapshot.data().status !== 'pending') {
      throw new Error('По этой заявке уже принято решение.');
    }

    transaction.update(applicationRef, {
      status: 'rejected',
      decidedAt: serverTimestamp(),
      decidedBy: actorUid,
      decisionComment: commentValue(input.comment),
    });
  });
}

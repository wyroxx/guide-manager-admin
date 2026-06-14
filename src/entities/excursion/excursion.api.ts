import {
  Timestamp,
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase/client';
import { GUIDE_LEVELS, type GuideLevel } from '../guide/guide.types';
import {
  type Excursion,
  type ExcursionApplicationSummary,
  type ExcursionInput,
  type PaymentStatus,
} from './excursion.types';

const excursionsCollection = collection(db, 'excursions');

export const excursionKeys = {
  all: ['excursions'] as const,
  detail: (excursionId: string) => ['excursions', excursionId] as const,
  applications: (excursionId: string) => ['excursions', excursionId, 'applications'] as const,
};

function guideLevels(value: unknown): GuideLevel[] {
  if (!Array.isArray(value)) return [];
  return value.filter((level): level is GuideLevel =>
    GUIDE_LEVELS.includes(level as GuideLevel),
  );
}

function paymentStatus(value: unknown): PaymentStatus {
  return value === 'paid' ? 'paid' : 'unpaid';
}

function excursionFromData(id: string, data: DocumentData): Excursion {
  const assignedGuides = Array.isArray(data.assignedGuides)
    ? data.assignedGuides.filter((email: unknown): email is string => typeof email === 'string')
    : [];
  const requiredGuides = typeof data.requiredGuides === 'number' ? data.requiredGuides : 0;

  return {
    id,
    title: data.title ?? '',
    startDate: data.startDate instanceof Timestamp ? data.startDate : null,
    endDate: data.endDate instanceof Timestamp ? data.endDate : null,
    route: data.route ?? '',
    meetingPlace: data.meetingPlace ?? '',
    companyId: data.companyId ?? '',
    companyName: data.companyName ?? '',
    requiredGuides,
    requiredLevels: guideLevels(data.requiredLevels),
    maxParticipants: typeof data.maxParticipants === 'number' ? data.maxParticipants : 0,
    hasSpots: assignedGuides.length < requiredGuides,
    hasLunch: data.hasLunch === true,
    hasMasterclass: data.hasMasterclass === true,
    excursionType: data.excursionType ?? '',
    paymentStatus: paymentStatus(data.paymentStatus),
    assignedGuides,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
    createdBy: data.createdBy ?? '',
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt : null,
    updatedBy: data.updatedBy,
  };
}

function excursionFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return excursionFromData(snapshot.id, snapshot.data());
}

async function getCompanyName(companyId: string) {
  const companySnapshot = await getDoc(doc(db, 'companies', companyId));
  if (!companySnapshot.exists()) throw new Error('Выбранная компания не найдена.');

  const name = companySnapshot.data().name;
  if (typeof name !== 'string' || !name.trim()) {
    throw new Error('У выбранной компании не заполнено название.');
  }

  return name.trim();
}

export async function listExcursions() {
  const snapshot = await getDocs(query(excursionsCollection, orderBy('startDate')));
  return snapshot.docs.map(excursionFromSnapshot);
}

export async function getExcursion(excursionId: string) {
  const snapshot = await getDoc(doc(excursionsCollection, excursionId));
  return snapshot.exists() ? excursionFromData(snapshot.id, snapshot.data()) : null;
}

export async function createExcursion(input: ExcursionInput, actorUid: string) {
  const companyName = await getCompanyName(input.companyId);
  const excursionRef = await addDoc(excursionsCollection, {
    title: input.title.trim(),
    startDate: Timestamp.fromDate(input.startDate),
    endDate: Timestamp.fromDate(input.endDate),
    route: input.route.trim(),
    meetingPlace: input.meetingPlace.trim(),
    companyId: input.companyId,
    companyName,
    requiredGuides: input.requiredGuides,
    requiredLevels: input.requiredLevels,
    maxParticipants: input.maxParticipants,
    hasSpots: true,
    hasLunch: input.hasLunch,
    hasMasterclass: input.hasMasterclass,
    excursionType: input.excursionType.trim(),
    paymentStatus: input.paymentStatus,
    assignedGuides: [],
    createdAt: serverTimestamp(),
    createdBy: actorUid,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  return excursionRef.id;
}

export async function updateExcursion(
  excursionId: string,
  input: ExcursionInput,
  actorUid: string,
) {
  const companyName = await getCompanyName(input.companyId);
  const excursionRef = doc(excursionsCollection, excursionId);

  await runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(excursionRef);
    if (!snapshot.exists()) throw new Error('Экскурсия не найдена.');

    const assignedGuides = Array.isArray(snapshot.data().assignedGuides)
      ? snapshot.data().assignedGuides.filter((email: unknown) => typeof email === 'string')
      : [];

    transaction.update(excursionRef, {
      title: input.title.trim(),
      startDate: Timestamp.fromDate(input.startDate),
      endDate: Timestamp.fromDate(input.endDate),
      route: input.route.trim(),
      meetingPlace: input.meetingPlace.trim(),
      companyId: input.companyId,
      companyName,
      requiredGuides: input.requiredGuides,
      requiredLevels: input.requiredLevels,
      maxParticipants: input.maxParticipants,
      hasSpots: assignedGuides.length < input.requiredGuides,
      hasLunch: input.hasLunch,
      hasMasterclass: input.hasMasterclass,
      excursionType: input.excursionType.trim(),
      paymentStatus: input.paymentStatus,
      updatedAt: serverTimestamp(),
      updatedBy: actorUid,
    });
  });
}

export async function listExcursionApplications(excursionId: string) {
  const applicationsCollection = collection(db, 'excursions', excursionId, 'applications');
  const snapshot = await getDocs(query(applicationsCollection, orderBy('createdAt')));

  return snapshot.docs.map((application): ExcursionApplicationSummary => {
    const data = application.data();
    return {
      id: application.id,
      guideUid: data.guideUid ?? application.id,
      guideEmail: data.guideEmail ?? '',
      status: data.status === 'accepted' || data.status === 'rejected' ? data.status : 'pending',
      createdAt: data.createdAt instanceof Timestamp ? data.createdAt : null,
    };
  });
}

export async function deleteExcursion(excursionId: string) {
  const excursionRef = doc(excursionsCollection, excursionId);
  const applications = await getDocs(collection(excursionRef, 'applications'));

  if (applications.size > 499) {
    throw new Error('У экскурсии слишком много заявок для удаления из web-клиента.');
  }

  const batch = writeBatch(db);
  applications.docs.forEach((application) => batch.delete(application.ref));
  batch.delete(excursionRef);
  await batch.commit();
}

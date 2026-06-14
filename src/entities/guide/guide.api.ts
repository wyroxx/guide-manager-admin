import {
  collection,
  deleteDoc,
  deleteField,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase/client';
import { type Guide, type GuideInput } from './guide.types';

const guidesCollection = collection(db, 'guides');

export const guideKeys = {
  all: ['guides'] as const,
  detail: (uid: string) => ['guides', uid] as const,
};

function optional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function guideFromData(id: string, data: DocumentData): Guide {
  return {
    uid: id,
    email: data.email ?? '',
    name: data.name ?? '',
    phone: data.phone,
    telegramAlias: data.telegramAlias,
    level: data.level ?? 'trainee',
    toursCount: data.toursCount ?? 0,
    createdAt: data.createdAt ?? null,
    createdBy: data.createdBy ?? '',
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy,
  };
}

function guideFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return guideFromData(snapshot.id, snapshot.data());
}

export async function listGuides() {
  const snapshot = await getDocs(query(guidesCollection, orderBy('name')));
  return snapshot.docs.map(guideFromSnapshot);
}

export async function getGuide(uid: string) {
  const snapshot = await getDoc(doc(guidesCollection, uid));
  return snapshot.exists() ? guideFromData(snapshot.id, snapshot.data()) : null;
}

export async function createGuide(input: GuideInput, actorUid: string) {
  const guideRef = doc(guidesCollection, input.uid.trim());
  const existing = await getDoc(guideRef);

  if (existing.exists()) {
    throw new Error('Гид с таким UID уже существует.');
  }

  const phone = optional(input.phone);
  const telegramAlias = optional(input.telegramAlias);

  await setDoc(guideRef, {
    uid: input.uid.trim(),
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    ...(phone ? { phone } : {}),
    ...(telegramAlias ? { telegramAlias } : {}),
    level: input.level,
    toursCount: 0,
    createdAt: serverTimestamp(),
    createdBy: actorUid,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });
}

export async function updateGuide(
  uid: string,
  input: Omit<GuideInput, 'uid'>,
  actorUid: string,
) {
  const phone = optional(input.phone);
  const telegramAlias = optional(input.telegramAlias);

  await updateDoc(doc(guidesCollection, uid), {
    email: input.email.trim().toLowerCase(),
    name: input.name.trim(),
    phone: phone ?? deleteField(),
    telegramAlias: telegramAlias ?? deleteField(),
    level: input.level,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });
}

export async function deleteGuide(uid: string) {
  await deleteDoc(doc(guidesCollection, uid));
}

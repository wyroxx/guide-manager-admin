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
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from 'firebase/firestore';
import { db } from '../../firebase/client';
import { isGuideLevel, type Guide, type GuideInput, type GuideLevelValue } from './guide.types';

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
  const level: GuideLevelValue = isGuideLevel(data.level) ? data.level : '';

  return {
    uid: id,
    email: data.email ?? '',
    name: data.name ?? '',
    phone: data.phone,
    telegramAlias: data.telegramAlias,
    level,
    isApproved: data.isApproved === true,
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

export async function updateGuide(
  uid: string,
  input: GuideInput,
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

export async function approveGuide(uid: string, actorUid: string) {
  const guideRef = doc(guidesCollection, uid);
  const snapshot = await getDoc(guideRef);
  if (!snapshot.exists()) throw new Error('Гид не найден.');

  const guide = snapshot.data();
  if (!isGuideLevel(guide.level)) {
    throw new Error('Перед одобрением назначьте уровень гида.');
  }
  if (typeof guide.email !== 'string' || !guide.email.trim()) {
    throw new Error('Перед одобрением укажите email гида.');
  }
  if (typeof guide.name !== 'string' || !guide.name.trim()) {
    throw new Error('Перед одобрением укажите имя гида.');
  }

  await updateDoc(guideRef, {
    isApproved: true,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });
}

export async function deleteGuide(uid: string) {
  await deleteDoc(doc(guidesCollection, uid));
}

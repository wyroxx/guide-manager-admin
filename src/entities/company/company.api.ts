import {
  addDoc,
  arrayRemove,
  arrayUnion,
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
import { type Company, type CompanyInput } from './company.types';

const companiesCollection = collection(db, 'companies');

export const companyKeys = {
  all: ['companies'] as const,
  detail: (companyId: string) => ['companies', companyId] as const,
};

function optional(value: string | undefined) {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function companyFromData(id: string, data: DocumentData): Company {
  return {
    id,
    name: data.name ?? '',
    contactName: data.contactName,
    phone: data.phone,
    telegramAlias: data.telegramAlias,
    notes: data.notes,
    banList: Array.isArray(data.banList) ? data.banList : [],
    createdAt: data.createdAt ?? null,
    createdBy: data.createdBy ?? '',
    updatedAt: data.updatedAt ?? null,
    updatedBy: data.updatedBy,
  };
}

function companyFromSnapshot(snapshot: QueryDocumentSnapshot<DocumentData>) {
  return companyFromData(snapshot.id, snapshot.data());
}

export async function listCompanies() {
  const snapshot = await getDocs(query(companiesCollection, orderBy('name')));
  return snapshot.docs.map(companyFromSnapshot);
}

export async function getCompany(companyId: string) {
  const snapshot = await getDoc(doc(companiesCollection, companyId));
  return snapshot.exists() ? companyFromData(snapshot.id, snapshot.data()) : null;
}

export async function createCompany(input: CompanyInput, actorUid: string) {
  const contactName = optional(input.contactName);
  const phone = optional(input.phone);
  const telegramAlias = optional(input.telegramAlias);
  const notes = optional(input.notes);

  const companyRef = await addDoc(companiesCollection, {
    name: input.name.trim(),
    ...(contactName ? { contactName } : {}),
    ...(phone ? { phone } : {}),
    ...(telegramAlias ? { telegramAlias } : {}),
    ...(notes ? { notes } : {}),
    banList: [],
    createdAt: serverTimestamp(),
    createdBy: actorUid,
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });

  return companyRef.id;
}

export async function updateCompany(
  companyId: string,
  input: CompanyInput,
  actorUid: string,
) {
  await updateDoc(doc(companiesCollection, companyId), {
    name: input.name.trim(),
    contactName: optional(input.contactName) ?? deleteField(),
    phone: optional(input.phone) ?? deleteField(),
    telegramAlias: optional(input.telegramAlias) ?? deleteField(),
    notes: optional(input.notes) ?? deleteField(),
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });
}

export async function deleteCompany(companyId: string) {
  await deleteDoc(doc(companiesCollection, companyId));
}

export async function addGuideToCompanyBanList(
  companyId: string,
  guideEmail: string,
  actorUid: string,
) {
  await updateDoc(doc(companiesCollection, companyId), {
    banList: arrayUnion(guideEmail.trim().toLowerCase()),
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });
}

export async function removeGuideFromCompanyBanList(
  companyId: string,
  guideEmail: string,
  actorUid: string,
) {
  await updateDoc(doc(companiesCollection, companyId), {
    banList: arrayRemove(guideEmail.trim()),
    updatedAt: serverTimestamp(),
    updatedBy: actorUid,
  });
}

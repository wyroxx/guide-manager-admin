import { readFile } from 'node:fs/promises';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
} from '@firebase/rules-unit-testing';
import {
  Timestamp,
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from 'firebase/firestore';

const projectId = 'tourapp-66e02';
const testEnvironment = await initializeTestEnvironment({
  projectId,
  firestore: {
    host: '127.0.0.1',
    port: 8080,
    rules: await readFile('firestore.rules', 'utf8'),
  },
});

const companyId = 'smoke-company';
const guideEmail = 'guide-smoke@example.com';
const companyRefPath = `companies/${companyId}`;

try {
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), companyRefPath), {
      name: 'Smoke Test Company',
      banList: [],
    });
  });

  const adminDb = testEnvironment
    .authenticatedContext('admin-smoke', {
      admin: true,
      email: 'admin-smoke@example.com',
    })
    .firestore();
  const regularDb = testEnvironment
    .authenticatedContext('regular-smoke', {
      email: 'regular-smoke@example.com',
    })
    .firestore();
  const companyRef = doc(adminDb, companyRefPath);

  await assertSucceeds(updateDoc(companyRef, { banList: arrayUnion(guideEmail) }));
  let company = await getDoc(companyRef);
  if (!company.data()?.banList.includes(guideEmail)) {
    throw new Error('Blacklist add smoke-test failed.');
  }

  await assertSucceeds(updateDoc(companyRef, { banList: arrayRemove(guideEmail) }));
  company = await getDoc(companyRef);
  if (company.data()?.banList.includes(guideEmail)) {
    throw new Error('Blacklist remove smoke-test failed.');
  }

  const validExcursion = {
    title: 'Smoke Test Excursion',
    companyId,
    companyName: 'Smoke Test Company',
    startDate: Timestamp.fromDate(new Date('2030-01-01T10:00:00Z')),
    endDate: Timestamp.fromDate(new Date('2030-01-01T12:00:00Z')),
    route: 'Test route',
    meetingPlace: 'Test meeting place',
    requiredGuides: 2,
    requiredLevels: ['junior', 'middle'],
    maxParticipants: 20,
    hasLunch: false,
    hasMasterclass: true,
    excursionType: 'Test',
    paymentStatus: 'unpaid',
    assignedGuides: [],
    hasSpots: true,
  };

  await assertSucceeds(setDoc(doc(adminDb, 'excursions/smoke-valid'), validExcursion));
  await assertFails(setDoc(doc(adminDb, 'excursions/smoke-invalid-spots'), {
    ...validExcursion,
    hasSpots: false,
  }));
  await assertFails(setDoc(doc(regularDb, 'excursions/smoke-unauthorized'), validExcursion));

  await assertSucceeds(updateDoc(doc(adminDb, 'excursions/smoke-valid'), {
    assignedGuides: ['guide-one@example.com', 'guide-two@example.com'],
    hasSpots: false,
  }));
  await assertSucceeds(updateDoc(doc(adminDb, 'excursions/smoke-valid'), {
    requiredGuides: 3,
    hasSpots: true,
  }));

  console.log('Firestore rules smoke-test passed: blacklist, auth and hasSpots invariants.');
} finally {
  await testEnvironment.clearFirestore();
  await testEnvironment.cleanup();
}

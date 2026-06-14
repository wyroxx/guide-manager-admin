import { readFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
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
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import { validateApplicationAcceptance } from '../src/entities/application/application.logic.ts';

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
    await setDoc(doc(context.firestore(), 'guides/guide-smoke'), {
      email: guideEmail,
      name: 'Smoke Guide',
      level: 'middle',
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

  const applicationData = {
    guideUid: 'guide-smoke',
    guideEmail,
    status: 'pending',
    excursionId: 'smoke-valid',
    excursionTitle: validExcursion.title,
    excursionStartDate: validExcursion.startDate,
    excursionMaxParticipants: validExcursion.maxParticipants,
    createdAt: Timestamp.fromDate(new Date('2029-12-01T10:00:00Z')),
  };
  await testEnvironment.withSecurityRulesDisabled(async (context) => {
    await setDoc(
      doc(context.firestore(), 'excursions/smoke-valid/applications/guide-smoke'),
      applicationData,
    );
    await setDoc(
      doc(context.firestore(), 'excursions/smoke-valid/applications/guide-reject'),
      { ...applicationData, guideUid: 'guide-reject', guideEmail: 'reject@example.com' },
    );
    await setDoc(
      doc(context.firestore(), 'excursions/smoke-valid/applications/guide-unpaired'),
      { ...applicationData, guideUid: 'guide-unpaired', guideEmail: 'unpaired@example.com' },
    );
  });

  const acceptBatch = writeBatch(adminDb);
  acceptBatch.update(doc(adminDb, 'excursions/smoke-valid/applications/guide-smoke'), {
    status: 'accepted',
    decidedAt: serverTimestamp(),
    decidedBy: 'admin-smoke',
  });
  acceptBatch.update(doc(adminDb, 'excursions/smoke-valid'), {
    assignedGuides: ['guide-one@example.com', 'guide-two@example.com', guideEmail],
    hasSpots: false,
  });
  await assertSucceeds(acceptBatch.commit());

  await assertSucceeds(updateDoc(
    doc(adminDb, 'excursions/smoke-valid/applications/guide-reject'),
    {
      status: 'rejected',
      decidedAt: serverTimestamp(),
      decidedBy: 'admin-smoke',
      decisionComment: 'Not this time',
    },
  ));
  await assertFails(updateDoc(
    doc(adminDb, 'excursions/smoke-valid/applications/guide-smoke'),
    {
      status: 'rejected',
      decidedAt: serverTimestamp(),
      decidedBy: 'admin-smoke',
    },
  ));
  await assertFails(updateDoc(
    doc(adminDb, 'excursions/smoke-valid/applications/guide-unpaired'),
    {
      status: 'accepted',
      decidedAt: serverTimestamp(),
      decidedBy: 'admin-smoke',
    },
  ));

  const validDecision = validateApplicationAcceptance({
    applicationStatus: 'pending',
    applicationEmail: guideEmail,
    assignedGuides: [],
    banList: [],
    guideEmail,
    guideLevel: 'middle',
    requiredGuides: 2,
    requiredLevels: ['middle'],
  });
  assert.deepEqual(validDecision.nextAssignedGuides, [guideEmail]);
  assert.equal(validDecision.hasSpots, true);
  assert.throws(() => validateApplicationAcceptance({
    applicationStatus: 'pending',
    applicationEmail: guideEmail,
    assignedGuides: [],
    banList: [guideEmail],
    guideEmail,
    guideLevel: 'middle',
    requiredGuides: 2,
    requiredLevels: ['middle'],
  }), /blacklist/);
  assert.throws(() => validateApplicationAcceptance({
    applicationStatus: 'pending',
    applicationEmail: guideEmail,
    assignedGuides: ['first@example.com'],
    banList: [],
    guideEmail,
    guideLevel: 'middle',
    requiredGuides: 1,
    requiredLevels: ['middle'],
  }), /свободных мест/);

  console.log('Firestore rules smoke-test passed: blacklist, decisions and hasSpots invariants.');
} finally {
  await testEnvironment.clearFirestore();
  await testEnvironment.cleanup();
}

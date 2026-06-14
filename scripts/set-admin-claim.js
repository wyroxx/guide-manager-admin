import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { loadEnvFile } from 'node:process';
import { applicationDefault, cert, getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

if (!process.env.FIREBASE_CREDENTIALS && existsSync('.env')) {
  loadEnvFile('.env');
}

const email = process.argv[2]?.trim();

if (!email) {
  console.error('Usage: npm run admin:set -- admin@email.com');
  process.exit(1);
}

async function getCredential() {
  const credentialsPath = process.env.FIREBASE_CREDENTIALS
    ?? process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentialsPath) return applicationDefault();

  const serviceAccount = JSON.parse(await readFile(credentialsPath, 'utf8'));
  return cert(serviceAccount);
}

try {
  const credential = await getCredential();
  const app = getApps()[0] ?? initializeApp({ credential });
  const adminAuth = getAuth(app);
  const user = await adminAuth.getUserByEmail(email);

  await adminAuth.setCustomUserClaims(user.uid, {
    ...user.customClaims,
    admin: true,
  });

  console.log(`Admin claim granted to ${email} (${user.uid}).`);
  console.log('The user must sign in again or refresh the ID token.');
} catch (error) {
  console.error('Unable to set admin claim:', error instanceof Error ? error.message : error);
  process.exit(1);
}

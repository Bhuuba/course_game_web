import { initializeApp, getApps } from 'firebase/app';
import {
  browserLocalPersistence,
  getAuth,
  setPersistence,
  signInAnonymously,
} from 'firebase/auth';
import {
  connectFirestoreEmulator,
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { connectAuthEmulator } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (Object.values(firebaseConfig).some((value) => !value)) {
  console.warn(
    'Missing Firebase configuration. Check your environment variables.',
  );
}

const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

export const auth = getAuth(app);
export const db = getFirestore(app);
export const functions = getFunctions(app, 'us-central1');

const shouldUseEmulators =
  import.meta.env.DEV ||
  import.meta.env.VITE_FIREBASE_EMULATORS === '1' ||
  (typeof process !== 'undefined' && process.env.FIREBASE_EMULATORS === '1');

if (shouldUseEmulators) {
  try {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', {
      disableWarnings: true,
    });
  } catch (err) {
    console.debug('Auth emulator already connected', err);
  }
  try {
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
  } catch (err) {
    console.debug('Firestore emulator already connected', err);
  }
  try {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
  } catch (err) {
    console.debug('Functions emulator already connected', err);
  }
}

let authInitialized = false;

export async function ensureSignedIn() {
  if (authInitialized) return;
  authInitialized = true;

  await setPersistence(auth, browserLocalPersistence);

  if (!auth.currentUser) {
    await signInAnonymously(auth);
  }
}

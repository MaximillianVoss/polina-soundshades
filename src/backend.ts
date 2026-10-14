import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { getApps, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword, getAuth,
  initializeAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut, updateProfile,
} from 'firebase/auth';
import {
  getDatabase, limitToLast, onValue, orderByChild, equalTo, push, query, ref, remove,
  runTransaction, serverTimestamp, set,
} from 'firebase/database';
import { createDemoBackend } from './demo';
import { authPersistence } from './persistence';
import {
  buildArtwork, buildComment, decodeArtworks, sortedArtworks, validateCredentials,
  type Backend, type User,
} from './domain';

export function createBackend(): Backend {
  const mode = process.env.EXPO_PUBLIC_BACKEND ?? 'demo';
  if (mode === 'demo') return createDemoBackend(AsyncStorage, {
    id: () => Crypto.randomUUID(),
    digest: (value) => Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value),
    now: () => Date.now(),
  });
  if (mode !== 'firebase') throw new Error('EXPO_PUBLIC_BACKEND должен быть demo или firebase.');
  const config = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.EXPO_PUBLIC_FIREBASE_DATABASE_URL,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  };
  if (Object.values(config).some((value) => !value?.trim())) throw new Error('Заполните все пять параметров Firebase в .env и перезапустите Expo.');
  const app = getApps().find((item) => item.name === 'soundshades') ?? initializeApp(config, 'soundshades');
  const auth = (() => {
    try {
      return initializeAuth(app, {
        persistence: authPersistence(),
      });
    } catch (error) {
      if ((error as { code?: string }).code === 'auth/already-initialized') return getAuth(app);
      throw error;
    }
  })();
  const database = getDatabase(app);
  let connected = false, registering = false;
  const authListeners = new Set<(user: User | null) => void>();
  const userValue = (): User | null => {
    const user = auth.currentUser;
    return user ? {
      id: user.uid, email: user.email ?? '',
      displayName: user.displayName?.trim().slice(0, 40) || user.email?.split('@')[0].slice(0, 40) || 'Участник',
    } : null;
  };
  const emitAuth = () => { if (!registering) authListeners.forEach((listener) => listener(userValue())); };
  const requireUser = (): User => {
    const user = userValue();
    if (!user) throw new Error('Сначала войдите.');
    if (!connected) throw new Error('Нет связи с Realtime Database. Дождитесь подключения.');
    return user;
  };
  return {
    mode: 'firebase',
    async init() { await auth.authStateReady(); },
    watchAuth(listener) {
      authListeners.add(listener);
      const off = onAuthStateChanged(auth, emitAuth);
      return () => { off(); authListeners.delete(listener); };
    },
    watchConnection(listener) {
      return onValue(ref(database, '.info/connected'), (snapshot) => {
        connected = snapshot.val() === true; listener(connected);
      }, () => { connected = false; listener(false); });
    },
    watchArtworks(listener, error, authorId) {
      const feed = authorId
        ? query(ref(database, 'artworks'), orderByChild('authorId'), equalTo(authorId), limitToLast(100))
        : query(ref(database, 'artworks'), orderByChild('createdAt'), limitToLast(50));
      return onValue(feed, (snapshot) => {
        const result = decodeArtworks(snapshot.val());
        listener(sortedArtworks(result.items, authorId), result.warning);
      }, error);
    },
    async register(email, password, displayName) {
      const valid = validateCredentials(email, password, displayName);
      registering = true;
      try {
        const result = await createUserWithEmailAndPassword(auth, valid.email, password);
        try { await updateProfile(result.user, { displayName: valid.displayName }); }
        catch (error) { await signOut(auth); throw error; }
      } finally { registering = false; emitAuth(); }
    },
    async login(email, password) {
      const valid = validateCredentials(email, password);
      await signInWithEmailAndPassword(auth, valid.email, password);
    },
    async logout() { await signOut(auth); },
    async publish(draft) {
      const user = requireUser();
      const target = push(ref(database, 'artworks'));
      const artwork = buildArtwork(draft, user, target.key!, Date.now());
      await set(target, { ...artwork, createdAt: serverTimestamp() });
    },
    async like(artwork) {
      const user = requireUser();
      await runTransaction(ref(database, `artworks/${artwork.id}/likes/${user.id}`), (value) => value === true ? null : true);
    },
    async comment(artworkId, text) {
      const comment = buildComment(requireUser(), text, Date.now());
      await set(push(ref(database, `artworks/${artworkId}/comments`)), { ...comment, createdAt: serverTimestamp() });
    },
    async removeArtwork(artworkId) { requireUser(); await remove(ref(database, `artworks/${artworkId}`)); },
    async removeComment(artworkId, commentId) { requireUser(); await remove(ref(database, `artworks/${artworkId}/comments/${commentId}`)); },
  };
}

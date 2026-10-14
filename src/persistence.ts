import { browserLocalPersistence, type Persistence } from 'firebase/auth';
// Web entry; Metro выбирает persistence.native.ts на Android/iOS.
export function authPersistence(): Persistence { return browserLocalPersistence; }

import {
  assertOwner, buildArtwork, buildComment, sortedArtworks, toggleLike, validateCredentials, validateDraft,
  type Artwork, type Backend, type User,
} from './domain.ts';

export interface StoragePort {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
export interface SecretPort { id(): string; digest(value: string): Promise<string>; now(): number }
type Account = User & { salt: string; passwordDigest: string };
type State = { version: 1; accounts: Account[]; artworks: Artwork[] };
const STATE_KEY = 'soundshades:demo:state:v1';
const SESSION_KEY = 'soundshades:demo:session:v1';

// Только демонстрация на одном устройстве. Локальные данные можно подменить.
// Даже salted SHA-256 не делает AsyncStorage безопасной серверной авторизацией.
export function createDemoBackend(storage: StoragePort, secrets: SecretPort): Backend {
  let state: State = { version: 1, accounts: [], artworks: [] };
  let currentId: string | null = null;
  let initialized = false;
  let tail: Promise<unknown> = Promise.resolve();
  const authListeners = new Set<(user: User | null) => void>();
  const feedListeners = new Set<() => void>();
  const currentUser = (): User | null => {
    const account = state.accounts.find((item) => item.id === currentId);
    return account ? { id: account.id, email: account.email, displayName: account.displayName } : null;
  };
  const requireUser = (): User => {
    const user = currentUser();
    if (!user) throw new Error('Сначала войдите.');
    return user;
  };
  const queue = <T>(job: () => Promise<T>): Promise<T> => {
    const result = tail.then(job);
    tail = result.catch(() => undefined);
    return result;
  };
  const save = async (next: State) => {
    await storage.setItem(STATE_KEY, JSON.stringify(next));
    state = next;
    feedListeners.forEach((listener) => listener());
  };
  const selectSession = async (id: string | null) => {
    if (id) await storage.setItem(SESSION_KEY, id); else await storage.removeItem(SESSION_KEY);
    currentId = id;
    authListeners.forEach((listener) => listener(currentUser()));
  };
  const changeArtwork = (id: string, transform: (item: Artwork, user: User) => Artwork) => queue(async () => {
    const user = requireUser();
    if (!state.artworks.some((item) => item.id === id)) throw new Error('Публикация уже удалена.');
    const artworks = state.artworks.map((item) => item.id === id ? transform(item, user) : item);
    await save({ ...state, artworks });
  });
  return {
    mode: 'demo',
    async init() {
      if (initialized) return;
      const raw = await storage.getItem(STATE_KEY);
      if (raw !== null) {
        try {
          const parsed = JSON.parse(raw) as State;
          if (parsed.version !== 1 || !Array.isArray(parsed.accounts) || !Array.isArray(parsed.artworks)) throw new Error();
          for (const account of parsed.accounts) {
            if (!account.id || !account.email || !account.displayName || !account.salt || !/^[a-f0-9]{64}$/.test(account.passwordDigest)) throw new Error();
          }
          for (const item of parsed.artworks) validateDraft({ version: 1, title: item.title, songId: item.songId, pixels: item.pixels }, true);
          state = parsed;
        } catch { throw new Error('Локальные данные повреждены. Очистите хранилище приложения или сайта, если их больше не нужно сохранять.'); }
      }
      currentId = await storage.getItem(SESSION_KEY);
      initialized = true;
    },
    watchAuth(listener) {
      authListeners.add(listener); listener(currentUser());
      return () => { authListeners.delete(listener); };
    },
    watchArtworks(listener, _error, authorId) {
      const emit = () => listener(sortedArtworks(state.artworks, authorId));
      feedListeners.add(emit); emit();
      return () => { feedListeners.delete(emit); };
    },
    watchConnection(listener) { listener(true); return () => {}; },
    register(email, password, displayName) {
      return queue(async () => {
        const valid = validateCredentials(email, password, displayName);
        if (state.accounts.some((item) => item.email === valid.email)) throw new Error('Этот email уже зарегистрирован.');
        const salt = secrets.id();
        const account: Account = {
          id: `demo-${secrets.id()}`, email: valid.email, displayName: valid.displayName!, salt,
          passwordDigest: await secrets.digest(`${salt}:${password}`),
        };
        await save({ ...state, accounts: [...state.accounts, account] });
        await selectSession(account.id);
      });
    },
    login(email, password) {
      return queue(async () => {
        const valid = validateCredentials(email, password);
        const account = state.accounts.find((item) => item.email === valid.email);
        if (!account || await secrets.digest(`${account.salt}:${password}`) !== account.passwordDigest) throw new Error('Не удалось войти. Проверьте email и пароль.');
        await selectSession(account.id);
      });
    },
    logout() { return queue(() => selectSession(null)); },
    publish(draft) {
      return queue(async () => {
        const artwork = buildArtwork(draft, requireUser(), secrets.id(), secrets.now());
        await save({ ...state, artworks: [...state.artworks, artwork] });
      });
    },
    like(artwork) { return changeArtwork(artwork.id, (item, user) => toggleLike(item, user.id)); },
    comment(artworkId, text) {
      return changeArtwork(artworkId, (item, user) => ({
        ...item, comments: { ...item.comments, [secrets.id()]: buildComment(user, text, secrets.now()) },
      }));
    },
    removeArtwork(artworkId) {
      return queue(async () => {
        const user = requireUser();
        const item = state.artworks.find((post) => post.id === artworkId);
        if (!item) throw new Error('Публикация уже удалена.');
        assertOwner(item.authorId, user.id);
        await save({ ...state, artworks: state.artworks.filter((post) => post.id !== artworkId) });
      });
    },
    removeComment(artworkId, commentId) {
      return changeArtwork(artworkId, (item, user) => {
        const comment = item.comments?.[commentId];
        if (!comment) throw new Error('Комментарий уже удалён.');
        assertOwner(comment.authorId, user.id);
        const comments = { ...item.comments }; delete comments[commentId];
        return { ...item, comments };
      });
    },
  };
}

export const GRID_SIZE = 16;
export const PIXEL_COUNT = GRID_SIZE * GRID_SIZE;
export const BACKGROUND = '#FFFFFF';
export const PALETTE = ['#FFFFFF', '#19243B', '#5661D8', '#37B7B1', '#F7D154', '#FF9065', '#E65B88', '#A980DD'] as const;
export const SONGS = [
  { id: 'sunrise', title: 'Лимонный рассвет', mood: 'Светлая мелодия · 6,4 с' },
  { id: 'rain', title: 'После дождя', mood: 'Спокойная мелодия · 6,4 с' },
  { id: 'night', title: 'Ночная линия', mood: 'Ритмичная мелодия · 6,4 с' },
] as const;
export type SongId = typeof SONGS[number]['id'];
export type Mode = 'demo' | 'firebase';
export type User = { id: string; email: string; displayName: string };
export type Draft = { version: 1; title: string; songId: SongId; pixels: string[] };
export type Comment = { authorId: string; authorName: string; text: string; createdAt: number };
export type Artwork = {
  id: string; authorId: string; authorName: string; title: string;
  songId: SongId; pixels: string[]; createdAt: number;
  likes?: Record<string, true>; comments?: Record<string, Comment>;
};
export interface Backend {
  mode: Mode;
  init(): Promise<void>;
  watchAuth(listener: (user: User | null) => void): () => void;
  watchArtworks(listener: (items: Artwork[], warning?: string) => void, error: (reason: Error) => void, authorId?: string): () => void;
  watchConnection(listener: (online: boolean) => void): () => void;
  register(email: string, password: string, displayName: string): Promise<void>;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
  publish(draft: Draft): Promise<void>;
  like(artwork: Artwork): Promise<void>;
  comment(artworkId: string, text: string): Promise<void>;
  removeArtwork(artworkId: string): Promise<void>;
  removeComment(artworkId: string, commentId: string): Promise<void>;
}

export function blankPixels(): string[] { return Array.from({ length: PIXEL_COUNT }, () => BACKGROUND); }
export function emptyDraft(): Draft { return { version: 1, title: '', songId: 'sunrise', pixels: blankPixels() }; }
export function isSongId(value: unknown): value is SongId { return SONGS.some((song) => song.id === value); }
export function validatePixels(pixels: unknown): asserts pixels is string[] {
  if (!Array.isArray(pixels) || pixels.length !== PIXEL_COUNT || Array.from(pixels).some((color) => !PALETTE.includes(color))) {
    throw new Error('Холст должен содержать 256 цветов из палитры.');
  }
}
export function paintPixel(pixels: string[], index: number, color: string): string[] {
  validatePixels(pixels);
  if (!Number.isInteger(index) || index < 0 || index >= PIXEL_COUNT) throw new Error('Недопустимый номер пикселя.');
  if (!PALETTE.includes(color as typeof PALETTE[number])) throw new Error('Выберите цвет из палитры.');
  return pixels.map((value, position) => position === index ? color : value);
}
export function validateCredentials(email: string, password: string, displayName?: string) {
  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || normalizedEmail.length > 254) throw new Error('Введите корректный email.');
  if (password.length < 8 || password.length > 128) throw new Error('Пароль: от 8 до 128 символов.');
  const name = displayName?.trim();
  if (displayName !== undefined && (!name || name.length > 40)) throw new Error('Имя: от 1 до 40 символов.');
  return { email: normalizedEmail, password, displayName: name };
}
export function validateDraft(value: unknown, publishing = false): Draft {
  if (!value || typeof value !== 'object') throw new Error('Черновик повреждён.');
  const data = value as Partial<Draft>;
  if (data.version !== 1 || typeof data.title !== 'string' || data.title.trim().length > 80 || !isSongId(data.songId)) throw new Error('Черновик повреждён.');
  validatePixels(data.pixels);
  if (publishing && !data.title.trim()) throw new Error('Добавьте название рисунка.');
  if (publishing && data.pixels.every((color) => color === BACKGROUND)) throw new Error('Нарисуйте хотя бы один цветной пиксель.');
  return { version: 1, title: data.title.trim(), songId: data.songId, pixels: [...data.pixels] };
}
export function parseDraft(raw: string | null): Draft {
  if (raw === null) return emptyDraft();
  try { return validateDraft(JSON.parse(raw)); }
  catch { throw new Error('Сохранённый черновик повреждён. Можно очистить его в редакторе.'); }
}
export function draftKey(mode: Mode, userId: string): string { return `soundshades:draft:v1:${mode}:${userId}`; }
export function buildArtwork(draft: Draft, user: User, id: string, createdAt: number): Artwork {
  const valid = validateDraft(draft, true);
  if (!id || !user.id || !user.displayName.trim() || !Number.isFinite(createdAt)) throw new Error('Недопустимые данные публикации.');
  return { id, authorId: user.id, authorName: user.displayName, title: valid.title, songId: valid.songId, pixels: valid.pixels, createdAt };
}
export function sortedArtworks(items: Artwork[], authorId?: string): Artwork[] {
  return items.filter((item) => !authorId || item.authorId === authorId).sort((a, b) => b.createdAt - a.createdAt || b.id.localeCompare(a.id));
}
export function decodeArtworks(raw: unknown): { items: Artwork[]; warning?: string } {
  const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object' && !Array.isArray(value);
  const text = (value: unknown, limit: number): value is string => typeof value === 'string' && !!value.trim() && value.length <= limit;
  const date = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;
  if (raw === null || raw === undefined) return { items: [] };
  if (!record(raw)) return { items: [], warning: 'Данные ленты повреждены. Проверьте базу и правила Firebase.' };
  const items: Artwork[] = [];
  let skipped = 0;
  for (const [id, value] of Object.entries(raw)) {
    try {
      if (!record(value) || value.id !== id || !/^[A-Za-z0-9_-]{1,80}$/.test(id)
        || !text(value.authorId, 128) || !text(value.authorName, 40) || !date(value.createdAt)) throw new Error('Неверный автор или дата.');
      const source = value.pixels;
      if ((!Array.isArray(source) && !record(source)) || Object.keys(source).length !== PIXEL_COUNT) throw new Error('Неверные пиксели.');
      // Realtime Database может вернуть массив как объект числовых ключей.
      const pixels = Array.from({ length: PIXEL_COUNT }, (_, index) => (source as Record<number, unknown>)[index]);
      const valid = validateDraft({ version: 1, title: value.title, songId: value.songId, pixels }, true);
      const artwork: Artwork = {
        id, authorId: value.authorId, authorName: value.authorName, title: valid.title,
        songId: valid.songId, pixels: valid.pixels, createdAt: value.createdAt,
      };
      if (value.likes !== undefined) {
        if (!record(value.likes) || Object.values(value.likes).some((like) => like !== true)) throw new Error('Неверные лайки.');
        artwork.likes = value.likes as Record<string, true>;
      }
      if (value.comments !== undefined) {
        if (!record(value.comments) || Object.values(value.comments).some((comment) => !record(comment)
          || !text(comment.authorId, 128) || !text(comment.authorName, 40) || !text(comment.text, 300) || !date(comment.createdAt))) throw new Error('Неверные комментарии.');
        artwork.comments = value.comments as Record<string, Comment>;
      }
      items.push(artwork);
    } catch { skipped++; }
  }
  if (!skipped) return { items };
  return {
    items,
    warning: `${items.length ? 'Пропущено' : 'Все записи ленты повреждены; пропущено'} повреждённых публикаций: ${skipped}. Проверьте базу и правила Firebase.`,
  };
}
export function toggleLike(artwork: Artwork, userId: string): Artwork {
  if (!userId) throw new Error('Сначала войдите.');
  const likes = { ...artwork.likes };
  if (likes[userId]) delete likes[userId]; else likes[userId] = true;
  return { ...artwork, likes };
}
export function buildComment(user: User, text: string, createdAt: number): Comment {
  const trimmed = text.trim();
  if (!trimmed || trimmed.length > 300) throw new Error('Комментарий: от 1 до 300 символов.');
  return { authorId: user.id, authorName: user.displayName, text: trimmed, createdAt };
}
export function assertOwner(ownerId: string, userId: string): void {
  if (!userId || ownerId !== userId) throw new Error('Удалять можно только свою запись.');
}
export function errorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code;
  const messages: Record<string, string> = {
    'auth/invalid-credential': 'Не удалось войти. Проверьте email и пароль.',
    'auth/wrong-password': 'Не удалось войти. Проверьте email и пароль.',
    'auth/user-not-found': 'Не удалось войти. Проверьте email и пароль.',
    'auth/email-already-in-use': 'Этот email уже зарегистрирован.',
    'auth/network-request-failed': 'Нет связи с Firebase. Проверьте интернет.',
    'auth/too-many-requests': 'Слишком много попыток. Попробуйте позже.',
    'auth/operation-not-allowed': 'В Firebase нужно включить Email/Password.',
    'auth/invalid-api-key': 'Проверьте публичную конфигурацию Firebase в .env.',
    'PERMISSION_DENIED': 'Firebase отклонил запись. Проверьте владельца, поля и database.rules.json.',
  };
  return (code && messages[code]) || (error instanceof Error ? error.message : 'Не удалось выполнить действие.');
}

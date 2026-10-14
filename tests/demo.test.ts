import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createDemoBackend, type StoragePort } from '../src/demo.ts';
import { emptyDraft, paintPixel, type Artwork, type User } from '../src/domain.ts';

function fixture() {
  const values = new Map<string, string>();
  let failWrites = false, sequence = 0;
  const storage: StoragePort = {
    async getItem(key) { return values.get(key) ?? null; },
    async setItem(key, value) { if (failWrites) throw new Error('Storage full'); values.set(key, value); },
    async removeItem(key) { values.delete(key); },
  };
  const secrets = { id: () => `id-${++sequence}`, now: () => ++sequence, digest: async (value: string) => createHash('sha256').update(value).digest('hex') };
  const backend = createDemoBackend(storage, secrets);
  return { backend, storage, secrets, values, fail: () => { failWrites = true; } };
}
const draft = () => ({ ...emptyDraft(), title: 'Мелодия', pixels: paintPixel(emptyDraft().pixels, 8, '#37B7B1') });

test('регистрация/выход/вход: пароля в сохранённых данных нет, email уникален', async () => {
  const f = fixture(); await f.backend.init();
  let actor: User | null = null; f.backend.watchAuth((user) => { actor = user; });
  await f.backend.register(' ALICE@example.test ', 'demoPass1!', 'Алиса');
  assert.equal((actor as unknown as User).email, 'alice@example.test');
  assert.ok(![...f.values.values()].join('').includes('demoPass1!'));
  assert.match([...f.values.values()].join(''), /passwordDigest/);
  await assert.rejects(f.backend.register('alice@example.test', 'anotherPass', 'Алиса'), /зарегистрирован/);
  await f.backend.logout(); assert.equal(actor, null);
  await assert.rejects(f.backend.login('alice@example.test', 'wrongPass'), /Проверьте/);
  await f.backend.login('alice@example.test', 'demoPass1!');
  assert.equal((actor as unknown as User).displayName, 'Алиса');
});
test('два аккаунта проходят публикацию/ленту/лайк/комментарий с проверкой владельца', async () => {
  const f = fixture(); await f.backend.init();
  let feed: Artwork[] = []; const unsubscribe = f.backend.watchArtworks((items) => { feed = items; }, () => {});
  await assert.rejects(f.backend.publish(draft()), /войдите/);
  await f.backend.register('alice@example.test', 'demoPass1!', 'Алиса');
  await f.backend.publish(draft()); const alicePost = feed[0];
  await f.backend.logout();
  await f.backend.register('bob@example.test', 'demoPass2!', 'Боб');
  await f.backend.like(alicePost); assert.equal(Object.keys(feed[0].likes ?? {}).length, 1);
  await f.backend.comment(alicePost.id, 'Хорошие цвета');
  const commentId = Object.keys(feed[0].comments ?? {})[0];
  await assert.rejects(f.backend.removeArtwork(alicePost.id), /свою/);
  await f.backend.logout(); await f.backend.login('alice@example.test', 'demoPass1!');
  await assert.rejects(f.backend.removeComment(alicePost.id, commentId), /свою/);
  await f.backend.removeArtwork(alicePost.id); assert.deepEqual(feed, []);
  unsubscribe();
});
test('состояние и сеанс восстанавливаются при новом запуске адаптера', async () => {
  const f = fixture(); await f.backend.init();
  await f.backend.register('alice@example.test', 'demoPass1!', 'Алиса'); await f.backend.publish(draft());
  const reopened = createDemoBackend(f.storage, f.secrets); await reopened.init();
  let actor: User | null = null, items: Artwork[] = [];
  reopened.watchAuth((value) => { actor = value; }); reopened.watchArtworks((value) => { items = value; }, () => {});
  assert.equal((actor as unknown as User).displayName, 'Алиса'); assert.equal(items.length, 1);
});
test('ошибка записи не отображается как успешная публикация', async () => {
  const f = fixture(); await f.backend.init(); await f.backend.register('alice@example.test', 'demoPass1!', 'Алиса');
  let feed: Artwork[] = []; f.backend.watchArtworks((value) => { feed = value; }, () => {});
  f.fail(); await assert.rejects(f.backend.publish(draft()), /Storage full/); assert.deepEqual(feed, []);
});
test('параллельные лайки сериализуются, не теряя изменения', async () => {
  const f = fixture(); await f.backend.init(); await f.backend.register('alice@example.test', 'demoPass1!', 'Алиса');
  let feed: Artwork[] = []; f.backend.watchArtworks((value) => { feed = value; }, () => {});
  await f.backend.publish(draft()); const post = feed[0];
  await Promise.all([f.backend.like(post), f.backend.like(post)]);
  assert.equal(Object.keys(feed[0].likes ?? {}).length, 0);
});
test('отписка от ленты освобождает слушатель', async () => {
  const f = fixture(); await f.backend.init(); await f.backend.register('alice@example.test', 'demoPass1!', 'Алиса');
  let calls = 0; const off = f.backend.watchArtworks(() => { calls++; }, () => {});
  off(); await f.backend.publish(draft()); assert.equal(calls, 1);
});

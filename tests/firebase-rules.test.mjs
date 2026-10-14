import test, { before, beforeEach, after } from 'node:test';
import { readFile } from 'node:fs/promises';
import { initializeTestEnvironment, assertFails, assertSucceeds } from '@firebase/rules-unit-testing';
import { ref, set, remove, get, update } from 'firebase/database';

let env;
const post = (id = 'p1', authorId = 'alice') => ({
  id, authorId, authorName: 'Алиса', title: 'Рассвет', songId: 'sunrise',
  pixels: Array.from({ length: 256 }, (_, i) => i === 0 ? '#F7D154' : '#FFFFFF'), createdAt: Date.now(),
});
const db = (uid) => uid ? env.authenticatedContext(uid).database() : env.unauthenticatedContext().database();
before(async () => {
  const config = JSON.parse(await readFile(new URL('../firebase.json', import.meta.url), 'utf8'));
  env = await initializeTestEnvironment({
    projectId: 'demo-soundshades',
    database: { host: config.emulators.database.host, port: config.emulators.database.port, rules: await readFile(new URL('../database.rules.json', import.meta.url), 'utf8') },
  });
});
beforeEach(async () => { await env.clearDatabase(); });
after(async () => { await env?.cleanup(); });

test('неавторизованный пользователь не читает и не пишет', async () => {
  await assertFails(get(ref(db(), 'artworks')));
  await assertFails(set(ref(db(), 'artworks/p1'), post()));
});
test('владелец публикует; авторизованный читатель видит работу', async () => {
  await assertSucceeds(set(ref(db('alice'), 'artworks/p1'), post()));
  await assertSucceeds(get(ref(db('bob'), 'artworks/p1')));
});
test('нельзя подделать authorId, id или добавить неизвестные поля', async () => {
  await assertFails(set(ref(db('bob'), 'artworks/p1'), post()));
  await assertFails(set(ref(db('alice'), 'artworks/p1'), { ...post(), id: 'different' }));
  await assertFails(set(ref(db('alice'), 'artworks/p1'), { ...post(), admin: true }));
});
test('неверные название, песня, дата, размер и цвет отвергаются сервером', async () => {
  for (const data of [
    { ...post(), title: '' }, { ...post(), title: '   ' }, { ...post(), title: 'x'.repeat(81) },
    { ...post(), songId: 'other' }, { ...post(), createdAt: 0 },
    { ...post(), pixels: ['#FFFFFF'] }, { ...post(), pixels: Array(256).fill('#000000') },
  ]) await assertFails(set(ref(db('alice'), 'artworks/p1'), data));
});
test('256 ключей вне диапазона пикселей отвергаются', async () => {
  const pixels = Object.fromEntries(Array.from({ length: 256 }, (_, i) => [String(i + 1), '#FFFFFF']));
  await assertFails(set(ref(db('alice'), 'artworks/p1'), { ...post(), pixels }));
});
test('256 белых пикселей запрещены, цветной последний пиксель допустим', async () => {
  const pixels = Array(256).fill('#FFFFFF');
  await assertFails(set(ref(db('alice'), 'artworks/p1'), { ...post(), pixels }));
  pixels[255] = '#F7D154';
  await assertSucceeds(set(ref(db('alice'), 'artworks/p1'), { ...post(), pixels }));
});
test('создание публикации не позволяет заранее подделать лайки или комментарии', async () => {
  await assertFails(set(ref(db('alice'), 'artworks/p1'), { ...post(), likes: { bob: true } }));
  await assertFails(set(ref(db('alice'), 'artworks/p1'), { ...post(), comments: { c1: { authorId: 'bob', authorName: 'Боб', text: 'Фальшивый', createdAt: Date.now() } } }));
});
test('публикация неизменяема; удалить её может только владелец', async () => {
  await set(ref(db('alice'), 'artworks/p1'), post());
  await assertFails(update(ref(db('alice'), 'artworks/p1'), { title: 'Замена' }));
  await assertFails(set(ref(db('bob'), 'artworks/p1/pixels/0'), '#E65B88'));
  await assertFails(remove(ref(db('bob'), 'artworks/p1')));
  await assertSucceeds(remove(ref(db('alice'), 'artworks/p1')));
});
test('каждый управляет только собственным булевым лайком', async () => {
  await set(ref(db('alice'), 'artworks/p1'), post());
  await assertSucceeds(set(ref(db('bob'), 'artworks/p1/likes/bob'), true));
  await assertFails(set(ref(db('alice'), 'artworks/p1/likes/bob'), true));
  await assertFails(set(ref(db('bob'), 'artworks/p1/likes/bob'), false));
  await assertFails(set(ref(db('bob'), 'artworks/missing/likes/bob'), true));
  await assertSucceeds(remove(ref(db('bob'), 'artworks/p1/likes/bob')));
});
test('комментарии привязаны к автору, длине и существующей публикации', async () => {
  await set(ref(db('alice'), 'artworks/p1'), post());
  const comment = { authorId: 'bob', authorName: 'Боб', text: 'Красиво', createdAt: Date.now() };
  await assertSucceeds(set(ref(db('bob'), 'artworks/p1/comments/c1'), comment));
  await assertFails(set(ref(db('alice'), 'artworks/p1/comments/c2'), comment));
  await assertFails(set(ref(db('bob'), 'artworks/p1/comments/c2'), { ...comment, text: 'x'.repeat(301) }));
  await assertFails(set(ref(db('bob'), 'artworks/p1/comments/c2'), { ...comment, text: ' ' }));
  await assertFails(set(ref(db('bob'), 'artworks/missing/comments/c1'), comment));
  await assertFails(remove(ref(db('alice'), 'artworks/p1/comments/c1')));
  await assertSucceeds(remove(ref(db('bob'), 'artworks/p1/comments/c1')));
});

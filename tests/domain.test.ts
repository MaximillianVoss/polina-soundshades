import test from 'node:test';
import assert from 'node:assert/strict';
import {
  blankPixels, paintPixel, validateCredentials, emptyDraft, validateDraft, parseDraft, draftKey,
  buildArtwork, sortedArtworks, decodeArtworks, toggleLike, buildComment, assertOwner, errorMessage,
} from '../src/domain.ts';
const user = { id: 'alice', displayName: 'Алиса', email: 'alice@example.test' };
const painted = () => ({ ...emptyDraft(), title: 'Рассвет', pixels: paintPixel(blankPixels(), 0, '#F7D154') });

test('новый холст содержит 256 белых пикселей', () => {
  const pixels = blankPixels();
  assert.equal(pixels.length, 256);
  assert.ok(pixels.every((pixel) => pixel === '#FFFFFF'));
});

test('холсты независимы; paintPixel не мутирует исходный массив', () => {
  const original = blankPixels();
  const changed = paintPixel(original, 255, '#E65B88');
  assert.equal(original[255], '#FFFFFF');
  assert.equal(changed[255], '#E65B88');
  assert.notEqual(original, changed);
  assert.notEqual(original, blankPixels());
});
test('редактор отклоняет неправильные индексы, цвета и размер', () => {
  for (const index of [-1, 256, 1.5, NaN]) assert.throws(() => paintPixel(blankPixels(), index, '#F7D154'));
  assert.throws(() => paintPixel(blankPixels(), 0, 'red'));
  assert.throws(() => paintPixel([], 0, '#F7D154'));
  assert.throws(() => paintPixel(new Array(256), 0, '#F7D154'));
});
test('email и имя нормализуются; пароль сохраняет введённые пробелы', () => {
  assert.deepEqual(validateCredentials(' Alice@Example.test ', ' pass123 ', ' Алиса '), { email: 'alice@example.test', password: ' pass123 ', displayName: 'Алиса' });
});
test('форма отклоняет неверный email, слабый пароль и пустое имя', () => {
  assert.throws(() => validateCredentials('bad', 'password'));
  assert.throws(() => validateCredentials('a@b.test', '123'));
  assert.throws(() => validateCredentials('a@b.test', '12345678', ' '));
  assert.throws(() => validateCredentials('a@b.test', '12345678', 'x'.repeat(41)));
});
test('пустой черновик допустим; пустую публикацию отправить нельзя', () => {
  assert.deepEqual(validateDraft(emptyDraft()), emptyDraft());
  assert.throws(() => validateDraft(emptyDraft(), true), /название/);
  assert.throws(() => validateDraft({ ...emptyDraft(), title: 'Название' }, true), /цветной/);
});
test('публикация требует известную песню и ровно 256 допустимых цветов', () => {
  assert.throws(() => validateDraft({ ...painted(), songId: 'unknown' }, true));
  assert.throws(() => validateDraft({ ...painted(), pixels: ['#FFFFFF'] }, true));
  assert.throws(() => validateDraft({ ...painted(), title: 'x'.repeat(81) }, true));
  const bad = painted(); bad.pixels[3] = '#000000';
  assert.throws(() => validateDraft(bad, true));
});
test('parseDraft отличает отсутствие, корректный JSON и повреждение', () => {
  assert.deepEqual(parseDraft(null), emptyDraft());
  assert.deepEqual(parseDraft(JSON.stringify(painted())), painted());
  assert.throws(() => parseDraft('{broken'), /повреждён/);
  assert.throws(() => parseDraft(JSON.stringify({ version: 3 })), /повреждён/);
});
test('черновики разделены по режиму и аккаунту', () => {
  assert.notEqual(draftKey('demo', 'alice'), draftKey('demo', 'bob'));
  assert.notEqual(draftKey('demo', 'alice'), draftKey('firebase', 'alice'));
});
test('buildArtwork привязывает автора к сеансу, обрезает заголовок и копирует пиксели', () => {
  const draft = { ...painted(), title: ' Рассвет ' };
  const post = buildArtwork(draft, user, 'p1', 1000);
  assert.equal(post.authorId, 'alice');
  assert.equal(post.authorName, 'Алиса');
  assert.equal(post.title, 'Рассвет');
  draft.pixels[0] = '#FFFFFF';
  assert.equal(post.pixels[0], '#F7D154');
});
test('лента сортируется, профиль фильтруется; исходный список не изменяется', () => {
  const first = buildArtwork(painted(), user, 'p1', 1);
  const second = { ...buildArtwork(painted(), user, 'p2', 2), authorId: 'bob' };
  const list = [first, second];
  assert.deepEqual(sortedArtworks(list).map((post) => post.id), ['p2', 'p1']);
  assert.deepEqual(sortedArtworks(list, 'alice').map((post) => post.id), ['p1']);
  assert.equal(list[0].id, 'p1');
});
test('повторный лайк снимается; чужие лайки сохраняются', () => {
  const post = { ...buildArtwork(painted(), user, 'p1', 1), likes: { bob: true as const } };
  const liked = toggleLike(post, 'alice');
  assert.deepEqual(liked.likes, { bob: true, alice: true });
  assert.deepEqual(toggleLike(liked, 'alice').likes, { bob: true });
  assert.deepEqual(post.likes, { bob: true });
  assert.throws(() => toggleLike(post, ''));
});
test('повреждённая и белая публикации не скрывают корректную Firebase-ленту', () => {
  const valid = buildArtwork(painted(), user, 'valid', 2);
  const white = { ...buildArtwork(painted(), user, 'white', 1), pixels: blankPixels() };
  const result = decodeArtworks({ white, broken: { title: 'Повреждено' }, valid });
  assert.deepEqual(result.items, [valid]);
  assert.match(result.warning ?? '', /2/);
});
test('только повреждённые публикации дают предупреждение, а не успешную пустую ленту', () => {
  const result = decodeArtworks({ bad: null });
  assert.deepEqual(result.items, []);
  assert.match(result.warning ?? '', /поврежд/);
  assert.deepEqual(decodeArtworks(null), { items: [] });
});
test('Firebase-пиксели с числовыми ключами читаются; неверные социальные поля изолируются', () => {
  const valid = buildArtwork(painted(), user, 'valid', 1);
  const bad = { ...valid, id: 'bad', comments: { corrupt: null } };
  const result = decodeArtworks({ valid: { ...valid, pixels: Object.fromEntries(valid.pixels.map((value, index) => [index, value])) }, bad });
  assert.deepEqual(result.items, [valid]);
  assert.ok(result.warning);
});
test('комментарий получает автора сеанса и проверяет длину', () => {
  assert.deepEqual(buildComment(user, ' Красиво! ', 10), { authorId: 'alice', authorName: 'Алиса', text: 'Красиво!', createdAt: 10 });
  assert.throws(() => buildComment(user, ' ', 10));
  assert.throws(() => buildComment(user, 'x'.repeat(301), 10));
});
test('удаление чужой записи запрещено', () => {
  assert.doesNotThrow(() => assertOwner('alice', 'alice'));
  assert.throws(() => assertOwner('alice', 'bob'));
  assert.throws(() => assertOwner('alice', ''));
});
test('ошибки Firebase преобразуются в понятные сообщения', () => {
  assert.match(errorMessage({ code: 'auth/invalid-credential' }), /Проверьте/);
  assert.match(errorMessage({ code: 'PERMISSION_DENIED' }), /отклонил/);
  assert.equal(errorMessage(new Error('Тест')), 'Тест');
});

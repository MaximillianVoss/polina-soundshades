import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet,
  Text, TextInput, View, useWindowDimensions,
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator, type NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { createBackend } from './src/backend';
import {
  GRID_SIZE, PALETTE, SONGS, draftKey, emptyDraft, errorMessage, paintPixel, parseDraft, validateDraft,
  type Artwork, type Backend, type Draft, type SongId, type User,
} from './src/domain';

type Routes = { Auth: undefined; Feed: undefined; Editor: undefined; Profile: undefined };
const Stack = createNativeStackNavigator<Routes>();
const AUDIO = {
  sunrise: require('./assets/audio/sunrise.wav'),
  rain: require('./assets/audio/rain.wav'),
  night: require('./assets/audio/night.wav'),
};
type Session = {
  backend: Backend; user: User | null; online: boolean;
  songId: SongId | null; playing: boolean; currentTime: number;
  playSong(songId: SongId): Promise<void>;
};
const SessionContext = createContext<Session | null>(null);
function useSession(): Session {
  const value = useContext(SessionContext);
  if (!value) throw new Error('Session provider missing');
  return value;
}

function Action({ title, onPress, disabled = false, quiet = false, selected = false }: {
  title: string; onPress: () => void; disabled?: boolean; quiet?: boolean; selected?: boolean;
}) {
  return <Pressable accessibilityRole="button" accessibilityLabel={title}
    accessibilityState={{ disabled, selected }} disabled={disabled} onPress={onPress}
    style={({ pressed }) => [styles.button, quiet && styles.quietButton, selected && styles.selectedButton,
      disabled && styles.disabled, pressed && !disabled && { opacity: 0.75 }]}>
    <Text style={[styles.buttonText, quiet && { color: '#DBDFFA' }]}>{title}</Text>
  </Pressable>;
}
function Notice({ text, error = false }: { text: string; error?: boolean }) {
  if (!text) return null;
  return <Text selectable accessibilityLiveRegion="polite" style={[styles.notice, error && styles.error]}>{text}</Text>;
}
function Menu() {
  const navigation = useNavigation<NativeStackNavigationProp<Routes>>();
  return <View style={styles.row}>
    <Action title="Лента" quiet onPress={() => navigation.navigate('Feed')} />
    <Action title="Рисовать" quiet onPress={() => navigation.navigate('Editor')} />
    <Action title="Профиль" quiet onPress={() => navigation.navigate('Profile')} />
  </View>;
}
function Page({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  const { backend, user, online } = useSession();
  return <SafeAreaView style={styles.page}>
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>SOUNDSHADES / {backend.mode === 'demo' ? 'ЛОКАЛЬНЫЙ DEMO' : 'FIREBASE'}</Text>
        <Text accessibilityRole="header" style={styles.heading}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
        {user && <Menu />}
        {backend.mode === 'demo'
          ? <Text style={styles.modeNote}>Учебный demo: аккаунты и публикации только на этом устройстве. Локальный вход можно подменить; для общих аккаунтов включите Firebase.</Text>
          : !online && <Notice text="Нет связи с базой. Черновик можно сохранить локально. Начатая отправка продолжится при восстановлении связи; не закрывайте приложение до подтверждения." error />}
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}
function PixelGrid({ pixels, onPaint, preview = false }: { pixels: string[]; onPaint?: (index: number) => void; preview?: boolean }) {
  const { width } = useWindowDimensions();
  const side = Math.max(128, Math.min(width - 64, preview ? 240 : 320));
  const cell = side / GRID_SIZE;
  return <View style={[styles.grid, { width: side, height: side }]} accessibilityLabel={onPaint ? undefined : 'Пиксель-арт 16 на 16'} accessible={!onPaint}>
    {pixels.map((color, index) => onPaint
      ? <Pressable key={index} accessibilityRole="button" accessibilityLabel={`Пиксель ${index + 1}`}
          onPress={() => onPaint(index)} style={{ width: cell, height: cell, backgroundColor: color, borderWidth: 0.25, borderColor: '#9BA1B1' }} />
      : <View key={index} style={{ width: cell, height: cell, backgroundColor: color }} />)}
  </View>;
}
function SongControl({ songId }: { songId: SongId }) {
  const session = useSession();
  const [error, setError] = useState('');
  const song = SONGS.find((item) => item.id === songId)!;
  const active = session.songId === songId && session.playing;
  return <View style={styles.gap}>
    <Action title={`${active ? 'Ⅱ Пауза' : '▶ Слушать'}: ${song.title}`} quiet onPress={() => {
      setError(''); void session.playSong(songId).catch((reason) => setError(errorMessage(reason)));
    }} />
    {active && <Text style={styles.small}>Звучит · {session.currentTime.toFixed(1)} с</Text>}
    <Notice text={error} error />
  </View>;
}

function AuthScreen() {
  const { backend } = useSession();
  const [registering, setRegistering] = useState(true);
  const [email, setEmail] = useState(''), [password, setPassword] = useState(''), [name, setName] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const submit = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      if (registering) await backend.register(email, password, name); else await backend.login(email, password);
      setPassword('');
    } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  };
  return <Page title="Какого цвета музыка?" subtitle="Выберите мелодию, нарисуйте настроение и поделитесь работой.">
    <View style={styles.panel}>
      <View style={styles.row}>
        <Action title="Регистрация" quiet selected={registering} disabled={busy} onPress={() => { setRegistering(true); setError(''); }} />
        <Action title="Вход" quiet selected={!registering} disabled={busy} onPress={() => { setRegistering(false); setError(''); }} />
      </View>
      {registering && <><Text style={styles.label}>Имя</Text><TextInput style={styles.input} accessibilityLabel="Имя"
        placeholder="Ваше имя" placeholderTextColor="#8790B4" value={name} onChangeText={setName} maxLength={40} editable={!busy} autoComplete="name" /></>}
      <Text style={styles.label}>Email</Text>
      <TextInput style={styles.input} accessibilityLabel="Email" placeholder="alice@example.test" placeholderTextColor="#8790B4"
        value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" autoCorrect={false}
        maxLength={254} editable={!busy} autoComplete="email" />
      <Text style={styles.label}>Пароль · минимум 8 символов</Text>
      <TextInput style={styles.input} accessibilityLabel="Пароль" placeholder="Для demo используйте учебный пароль" placeholderTextColor="#8790B4"
        value={password} onChangeText={setPassword} secureTextEntry autoCapitalize="none" maxLength={128} editable={!busy}
        autoComplete={registering ? 'new-password' : 'current-password'} onSubmitEditing={() => { void submit(); }} />
      <Notice text={error} error />
      <Action title={busy ? 'Подождите…' : registering ? 'Создать аккаунт' : 'Войти'} disabled={busy} onPress={() => { void submit(); }} />
    </View>
  </Page>;
}

function useArtworks(authorId?: string) {
  const { backend } = useSession();
  const [items, setItems] = useState<Artwork[]>([]), [loading, setLoading] = useState(true);
  const [error, setError] = useState(''), [attempt, setAttempt] = useState(0);
  useEffect(() => {
    setLoading(true); setError('');
    return backend.watchArtworks((value, warning) => { setItems(value); setError(warning ?? ''); setLoading(false); },
      (reason) => { setError(errorMessage(reason)); setLoading(false); }, authorId);
  }, [backend, authorId, attempt]);
  return { items, loading, error, retry: () => setAttempt((value) => value + 1) };
}
function ArtworkCard({ artwork }: { artwork: Artwork }) {
  const { backend, user, online } = useSession();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [showComments, setShowComments] = useState(false), [text, setText] = useState(''), [confirm, setConfirm] = useState(false);
  const comments = Object.entries(artwork.comments ?? {}).sort((a, b) => a[1].createdAt - b[1].createdAt);
  const disabled = busy || (backend.mode === 'firebase' && !online);
  const run = async (action: () => Promise<void>) => {
    if (busy) return;
    setBusy(true); setError('');
    try { await action(); } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  };
  return <View style={styles.panel}>
    <Text accessibilityRole="header" style={styles.cardTitle}>{artwork.title}</Text>
    <Text style={styles.small}>{artwork.authorName} · {new Date(artwork.createdAt).toLocaleString('ru-RU')}</Text>
    <PixelGrid pixels={artwork.pixels} preview />
    <SongControl songId={artwork.songId} />
    <View style={styles.row}>
      <Action title={`${artwork.likes?.[user!.id] ? '♥ Снять лайк' : '♡ Лайк'} (${Object.keys(artwork.likes ?? {}).length})`}
        quiet disabled={disabled} onPress={() => { void run(() => backend.like(artwork)); }} />
      <Action title={`Комментарии (${comments.length})`} quiet onPress={() => setShowComments(!showComments)} />
    </View>
    {showComments && <View style={styles.gap}>
      {comments.length === 0 && <Text style={styles.small}>Оставьте первый комментарий.</Text>}
      {comments.map(([id, comment]) => <View key={id} style={styles.comment}>
        <Text style={styles.label}>{comment.authorName}</Text><Text style={styles.body}>{comment.text}</Text>
        {comment.authorId === user!.id && <Action title="Удалить мой комментарий" quiet disabled={disabled}
          onPress={() => { void run(() => backend.removeComment(artwork.id, id)); }} />}
      </View>)}
      <TextInput style={styles.input} accessibilityLabel={`Комментарий к ${artwork.title}`} value={text} onChangeText={setText}
        placeholder="Что вы почувствовали?" placeholderTextColor="#8790B4" multiline maxLength={300} editable={!busy} />
      <Action title="Отправить комментарий" disabled={disabled || !text.trim()} onPress={() => {
        void run(async () => { await backend.comment(artwork.id, text); setText(''); });
      }} />
    </View>}
    {artwork.authorId === user!.id && <Action title="Удалить мою работу" quiet disabled={disabled} onPress={() => setConfirm(true)} />}
    {confirm && <View style={styles.comment}><Text style={styles.body}>Удалить эту работу вместе с лайками и комментариями?</Text>
      <Action title="Да, удалить работу" disabled={disabled} onPress={() => { void run(() => backend.removeArtwork(artwork.id)); }} />
      <Action title="Отмена" quiet disabled={busy} onPress={() => setConfirm(false)} />
    </View>}
    {busy && <Text style={styles.small}>Ожидаем подтверждения сохранения…</Text>}
    <Notice text={error} error />
  </View>;
}
function ArtworkList({ authorId }: { authorId?: string }) {
  const { items, loading, error, retry } = useArtworks(authorId);
  const navigation = useNavigation<NativeStackNavigationProp<Routes>>();
  if (loading) return <ActivityIndicator color="#FF9065" accessibilityLabel="Загрузка публикаций" />;
  return <View style={styles.gap}>
    <Notice text={error} error />
    {!!error && <Action title="Повторить загрузку" quiet onPress={retry} />}
    {!error && items.length === 0 && <View style={styles.panel}>
      <Text style={styles.cardTitle}>{authorId ? 'У вас пока нет работ' : 'Лента пока пустая'}</Text>
      <Text style={styles.body}>Начните с мелодии и нескольких цветных пикселей.</Text>
      <Action title="Создать рисунок" onPress={() => navigation.navigate('Editor')} />
    </View>}
    {items.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} />)}
  </View>;
}
function FeedScreen() {
  const { backend } = useSession();
  return <Page title="Звуки в цвете" subtitle={backend.mode === 'firebase' ? 'Последние 50 публикаций участников.' : 'Работы всех demo-аккаунтов на этом устройстве.'}>
    <ArtworkList />
  </Page>;
}

function EditorScreen() {
  const { backend, user, online } = useSession();
  const navigation = useNavigation<NativeStackNavigationProp<Routes>>();
  const [draft, setDraft] = useState<Draft>(emptyDraft), [color, setColor] = useState<string>(PALETTE[4]);
  const [saved, setSaved] = useState(JSON.stringify(emptyDraft())), [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false), [error, setError] = useState(''), [notice, setNotice] = useState(''), [confirm, setConfirm] = useState(false);
  const key = draftKey(backend.mode, user!.id);
  useEffect(() => {
    let active = true;
    void AsyncStorage.getItem(key).then((raw) => {
      if (!active) return;
      const restored = parseDraft(raw); setDraft(restored); setSaved(JSON.stringify(restored));
      if (raw) setNotice('Ваш сохранённый черновик восстановлен.');
    }).catch((reason) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setReady(true); });
    return () => { active = false; };
  }, [key]);
  const run = async (action: () => Promise<void>) => {
    if (busy || !ready) return;
    setBusy(true); setError(''); setNotice('');
    try { await action(); } catch (reason) { setError(errorMessage(reason)); }
    finally { setBusy(false); }
  };
  return <Page title="Нарисуйте настроение" subtitle="16 × 16 пикселей. Сначала послушайте мелодию, затем выберите её цвет.">
    <View style={styles.panel}>
      <Text style={styles.cardTitle}>1. Мелодия</Text>
      {SONGS.map((song) => <View key={song.id} style={styles.gap}>
        <Action title={`Выбрать: ${song.title}`} quiet selected={draft.songId === song.id} disabled={busy || !ready}
          onPress={() => setDraft((value) => ({ ...value, songId: song.id }))} />
        <Text style={styles.small}>{song.mood}</Text>
      </View>)}
      <SongControl songId={draft.songId} />
      <Text style={styles.cardTitle}>2. Цвет и рисунок</Text>
      <Text style={styles.small}>Рисуйте касаниями. Белый цвет — ластик.</Text>
      <View style={styles.palette}>{PALETTE.map((value) => <Pressable key={value} accessibilityRole="button"
        accessibilityLabel={`Цвет ${value}`} accessibilityState={{ selected: value === color, disabled: busy || !ready }}
        disabled={busy || !ready} onPress={() => setColor(value)}
        style={[styles.swatch, { backgroundColor: value }, value === color && styles.activeSwatch]} />)}</View>
      <Text style={styles.small}>Выбран цвет {color}</Text>
      {!ready ? <ActivityIndicator color="#FF9065" /> : <PixelGrid pixels={draft.pixels}
        onPaint={busy ? undefined : (index) => setDraft((value) => ({ ...value, pixels: paintPixel(value.pixels, index, color) }))} />}
      <Text style={styles.cardTitle}>3. Название</Text>
      <TextInput style={styles.input} accessibilityLabel="Название рисунка" placeholder="Например: Тёплый рассвет" placeholderTextColor="#8790B4"
        value={draft.title} maxLength={80} editable={ready && !busy} onChangeText={(title) => setDraft((value) => ({ ...value, title }))} />
      <Text style={styles.small}>{JSON.stringify(draft) === saved ? 'Черновик не изменён.' : 'Есть несохранённые изменения. Сохраните черновик перед выходом.'}</Text>
      <Notice text={error} error /><Notice text={notice} />
      <Action title="Сохранить черновик" quiet disabled={busy || !ready} onPress={() => { void run(async () => {
        const valid = validateDraft(draft); await AsyncStorage.setItem(key, JSON.stringify(valid));
        setDraft(valid); setSaved(JSON.stringify(valid)); setNotice('Черновик сохранён на устройстве.');
      }); }} />
      <Action title={busy ? 'Ожидаем сохранения…' : 'Опубликовать'} disabled={busy || !ready || (backend.mode === 'firebase' && !online)}
        onPress={() => { void run(async () => {
          await backend.publish(validateDraft(draft, true));
          const cleared = emptyDraft(); setDraft(cleared); setSaved(JSON.stringify(cleared));
          setNotice('Работа опубликована.');
          try { await AsyncStorage.removeItem(key); } catch { setNotice('Работа опубликована, но сохранённый черновик не удалось удалить.'); }
          navigation.navigate('Feed');
        }); }} />
      <Action title="Очистить рисунок и черновик" quiet disabled={busy || !ready} onPress={() => setConfirm(true)} />
      {confirm && <View style={styles.comment}><Text style={styles.body}>Удалить рисунок, название и сохранённый черновик?</Text>
        <Action title="Да, очистить" disabled={busy} onPress={() => { void run(async () => {
          await AsyncStorage.removeItem(key); const cleared = emptyDraft(); setDraft(cleared); setSaved(JSON.stringify(cleared));
          setConfirm(false); setNotice('Рисунок и черновик очищены.');
        }); }} />
        <Action title="Отмена" quiet disabled={busy} onPress={() => setConfirm(false)} />
      </View>}
    </View>
  </Page>;
}
function ProfileScreen() {
  const { user, backend } = useSession();
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  return <Page title={user!.displayName} subtitle="Ваш профиль и ваши публикации.">
    <View style={styles.panel}><Text style={styles.body}>{user!.email}</Text>
      <Text style={styles.small}>{backend.mode === 'firebase' ? 'Здесь показаны до 100 последних ваших работ.' : 'Здесь показаны все ваши локальные работы.'}</Text>
      <Notice text={error} error />
      <Action title={busy ? 'Выходим…' : 'Выйти'} quiet disabled={busy} onPress={() => {
        setBusy(true); setError(''); void backend.logout().catch((reason) => setError(errorMessage(reason))).finally(() => setBusy(false));
      }} />
    </View>
    <ArtworkList authorId={user!.id} />
  </Page>;
}

function SessionApp({ backend, user, online }: { backend: Backend; user: User | null; online: boolean }) {
  const player = useAudioPlayer(AUDIO.sunrise), status = useAudioPlayerStatus(player);
  const [songId, setSongId] = useState<SongId | null>(null);
  useEffect(() => { player.pause(); setSongId(null); }, [user?.id, player]);
  const playSong = async (id: SongId) => {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: false });
    if (id === songId && status.playing) { player.pause(); return; }
    if (id !== songId) { player.replace(AUDIO[id]); setSongId(id); }
    else if (status.duration > 0 && status.currentTime >= status.duration - 0.01) await player.seekTo(0);
    player.play();
  };
  return <SessionContext.Provider value={{ backend, user, online, songId, playing: status.playing, currentTime: status.currentTime, playSong }}>
    <NavigationContainer key={user?.id ?? 'signed-out'} theme={{
      dark: true, colors: { primary: '#FF9065', background: '#10162C', card: '#1D2540', text: '#FFFFFF', border: '#384567', notification: '#E65B88' },
      fonts: { regular: { fontFamily: 'System', fontWeight: '400' }, medium: { fontFamily: 'System', fontWeight: '500' }, bold: { fontFamily: 'System', fontWeight: '700' }, heavy: { fontFamily: 'System', fontWeight: '800' } },
    }}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? <><Stack.Screen name="Feed" component={FeedScreen} /><Stack.Screen name="Editor" component={EditorScreen} /><Stack.Screen name="Profile" component={ProfileScreen} /></>
          : <Stack.Screen name="Auth" component={AuthScreen} />}
      </Stack.Navigator>
    </NavigationContainer>
  </SessionContext.Provider>;
}
export default function App() {
  const [setup] = useState(() => {
    try { return { backend: createBackend(), error: '' }; }
    catch (reason) { return { backend: null, error: errorMessage(reason) }; }
  });
  const [user, setUser] = useState<User | null>(null), [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(true), [error, setError] = useState(setup.error);
  useEffect(() => {
    let active = true; const cleanup: (() => void)[] = [];
    if (!setup.backend) { setLoading(false); return; }
    void setup.backend.init().then(() => {
      if (!active) return;
      cleanup.push(setup.backend!.watchAuth(setUser), setup.backend!.watchConnection(setOnline));
    }).catch((reason) => { if (active) setError(errorMessage(reason)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; cleanup.forEach((off) => off()); };
  }, [setup]);
  return <SafeAreaProvider>
    {loading ? <View style={[styles.page, styles.center]}><ActivityIndicator color="#FF9065" /><Text style={styles.body}>Открываем SoundShades…</Text></View>
      : error || !setup.backend ? <SafeAreaView style={styles.page}><View style={styles.content}><Text style={styles.heading}>Не удалось запустить</Text><Notice text={error} error /><Text style={styles.body}>Проверьте конфигурацию или локальное хранилище, затем перезапустите приложение.</Text></View></SafeAreaView>
      : <SessionApp backend={setup.backend} user={user} online={online} />}
  </SafeAreaProvider>;
}

const styles = StyleSheet.create({
  flex: { flex: 1 }, page: { flex: 1, backgroundColor: '#10162C' }, center: { justifyContent: 'center', alignItems: 'center', gap: 16 },
  content: { padding: 20, gap: 16, maxWidth: 680, width: '100%', alignSelf: 'center', paddingBottom: 36 },
  eyebrow: { color: '#FF9065', fontWeight: '700', fontSize: 12, letterSpacing: 1.5 },
  heading: { color: '#FFFFFF', fontSize: 30, fontWeight: '800', lineHeight: 36 },
  subtitle: { color: '#B8C1E0', fontSize: 16, lineHeight: 23 },
  modeNote: { color: '#BECBE7', backgroundColor: '#1D2947', borderRadius: 12, padding: 12, lineHeight: 20 },
  panel: { backgroundColor: '#1C2540', padding: 16, borderRadius: 20, gap: 12, borderWidth: 1, borderColor: '#344363' },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, gap: { gap: 12 },
  button: { minHeight: 44, backgroundColor: '#FF9065', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FF9065' },
  quietButton: { backgroundColor: '#263250', borderColor: '#425071' }, selectedButton: { borderColor: '#F7D154', borderWidth: 2 },
  buttonText: { fontSize: 15, fontWeight: '700', color: '#17223A', textAlign: 'center', flexShrink: 1 }, disabled: { opacity: 0.45 },
  label: { color: '#E1E6FF', fontWeight: '700', lineHeight: 21 }, input: { backgroundColor: '#111A30', color: '#FFFFFF', minHeight: 48, borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#576485', fontSize: 16 },
  notice: { color: '#A6E6C5', lineHeight: 21 }, error: { color: '#FFB7BC' }, body: { color: '#D4DCF3', fontSize: 15, lineHeight: 22 }, small: { color: '#B4C2E2', fontSize: 13, lineHeight: 20 },
  cardTitle: { color: '#FFFFFF', fontSize: 20, lineHeight: 27, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', alignSelf: 'center', overflow: 'hidden', backgroundColor: '#FFFFFF' },
  palette: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 }, swatch: { width: 36, height: 36, borderRadius: 9, borderWidth: 2, borderColor: '#536383' }, activeSwatch: { borderWidth: 4, borderColor: '#FFFFFF' },
  comment: { gap: 8, padding: 12, backgroundColor: '#111B32', borderRadius: 12 },
});

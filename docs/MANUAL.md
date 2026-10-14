# Mobile final — SoundShades: полное решение и мануал

[Условие](ASSIGNMENT.md) · [README приложения](PROJECT-README.md) · [Фактические проверки](../VERIFICATION.md)

## 1. Какие требования нужно выполнить

Преподаватель просит одну итоговую мобильную работу: собственную тему предварительно направить на утверждение, реализовать приложение, разместить исходники и документацию в онлайн Git-репозитории, вести личный learning diary и продемонстрировать приложение с обзором компонентов, возможностей и кода. Масштаб, разнообразие технологий и качество завершения влияют на оценку. Точный срок и шкала баллов в исходном материале отсутствуют.

В документе предложен SoundShades: нарисовать цветовое впечатление от песни и поделиться им. Тема преподавателем пока не подтверждена. Этот комплект реализует предложение полностью в выбранном учебном объёме; он не утверждает, что внешнее согласование, публикация репозитория или личный дневник уже выполнены.

Предполагаемый уровень — ученица, знакомая с основами JavaScript/TypeScript, React-компонентами, props и state. Руководство объясняет промежуточные переходы. Если какая-то тема пока новая, сначала запустите demo, затем изучите чистую логику и только после неё Firebase.

Маршрут: требования → запуск demo → разбор моделей и редактора → локальное сохранение → публикация/лента/профиль → лайки и комментарии → настройка Firebase и правила → проверки → личный дневник, онлайн-репозиторий и демонстрация телефона. Ниже дан весь собственный исходный код, а не только отдельные примеры.

## 2. Что получилось и какие решения приняты

| Функция | Реализация и смысл |
|---|---|
| Регистрация, вход, выход | Проверяем форму; demo хранит соль и хеш, Firebase использует Email/Password |
| Выбор музыки | Три собственные процедурные WAV по 6,4 секунды доступны офлайн и из карточек ленты |
| Редактор | 16 × 16 ячеек, восемь цветов, белый ластик, очистка с подтверждением |
| Черновик | AsyncStorage; отдельный ключ для режима и uid; сохранение по кнопке и восстановление при открытии редактора |
| Публикация | Название 1–80 символов, известная песня и цветной рисунок; автор берётся из сеанса |
| Лента | Все локальные работы в demo; последние 50 общих работ в Firebase |
| Чтение повреждённых данных | `decodeArtworks` проверяет каждую Firebase-запись отдельно: неверные публикации пропускаются с предупреждением, корректные остаются видны |
| Профиль | Собственные работы; в Firebase до 100 последних собственных публикаций |
| Лайки | Каждый uid включает/снимает собственный лайк; в Firebase используется transaction |
| Комментарии | Текст 1–300 символов; автор может удалить свой комментарий |
| Удаление работы | Только автор; подтверждение; вместе с ней удаляются её лайки и комментарии |
| Навигация | React Navigation: Auth, Feed, Editor, Profile |
| Проверки | Pure logic, demo adapter, Security Rules Emulator, TypeScript, Expo Doctor и export |

Размер сетки, палитра и набор мелодий — наши решения для завершённого объёма. Лайки и комментарии были вопросом в идее и здесь реализованы. Перечень библиотек из идеи не превращён в обязательное условие. Camera и Notifications не имеют нужного действия пользователя в выбранном сценарии; Axios не нужен для Firebase SDK, Paper не нужен для используемых компонентов. Вместо них добавлены только реально используемые зависимости.

Demo честно обозначен прямо в интерфейсе. Его аккаунты, сеанс и общая лента существуют на одном устройстве или одном browser origin. Данные можно подменить в AsyncStorage: это учебная имитация входа, а не production-auth и не multi-device. Пароль в открытом виде не сохраняется; однократный salted SHA-256 не заменяет безопасное серверное хранение паролей. Для demo берите вымышленные email и отдельные учебные пароли.

Firebase-режим использует настоящий JS SDK Auth и Realtime Database и требует вашей настройки. При ошибке конфигурации приложение сообщает об ошибке и не подменяет Firebase локальным режимом. Облако, реальный телефон, macOS и signed native binaries не объявляются проверенными на основании Windows export.

## 3. Запуск готовой папки на Mac ученицы

Путь проекта:

```text
<локальный-путь>
```

В ZIP должна лежать папка `soundshades` с `package.json`, `package-lock.json`, `App.tsx`, `src`, `assets`, `scripts`, `tests`, `docs` и конфигурациями. Node.js нужен версии 24.x. Проверьте `node --version`; если Node отсутствует, установите Node 24 для macOS с [официального сайта Node.js](https://nodejs.org/en/download). Если nvm уже установлен в вашей оболочке, можно выполнить `nvm install 24` и `nvm use 24`.

Откройте Terminal:

```bash
cd <папка-этого-репозитория>
node --version
npm --version
npm ci
npm run typecheck
npm test
npx expo start --go --lan --port 0
```

`npm ci` устанавливает именно версии из lock-файла. Обычный `npm install` при создании нового проекта сформирует новый lock; для готового комплекта предпочтителен `npm ci`. Первой установке нужен интернет. Node/npm не устанавливаются в проект как дополнительная копия, а Python для этого приложения не требуется.

Оставьте Metro работающим. На Mac с установленным Xcode нажмите `i` для iOS Simulator; на телефоне откройте QR-код в совместимом с Expo SDK 57 Expo Go, находясь в одной сети с Mac. Для Android можно использовать устройство с Expo Go или установленный Android Emulator. Для блокирующей LAN сети альтернативой служит `npx expo start --go --tunnel --port 0`; это может потребовать дополнительной загрузки инструмента туннеля. Сразу считайте запуск успешным только после появления рабочего экрана устройства. Возможности CLI описаны в [документации Expo CLI](https://docs.expo.dev/more/expo-cli/).

`.env` для demo не нужен. В браузере запустите `npm run web`. Этот путь полезен для проверки форм и данных, но не доказывает работу нативного аудио, safe areas или экранной клавиатуры телефона. Хранилище браузера зависит от протокола, хоста и порта: `localhost` и `127.0.0.1` не делят demo-аккаунты.

Статический web-preview после сборки:

```bash
npm run build
npm run preview -- 8077
```

Откройте `http://127.0.0.1:8077`. Preview работает только на loopback и предназначен для этой локальной проверки. Остановите его `Ctrl+C`. `build` экспортирует JS/Hermes bundles для web/iOS/Android и assets; он не создаёт подписанную APK или IPA.

## 4. Создание с нуля, если хотите воспроизвести решение

Это приложение не зависит от скрытого starter-кода. Если папка `soundshades` уже существует, используйте её или выберите отдельную копию для учебного воспроизведения: следующие команды рассчитаны на новый каталог, а не на замену ваших файлов.

```bash
cd <папка-этого-репозитория>
mkdir soundshades
cd soundshades
mkdir -p src tests scripts assets/audio docs
```

Создайте файлы по разделу «Полный собственный код» ниже, сохраняя их имена и каталоги. `package-lock.json` не перепечатывается в мануале: при работе из ZIP он уже есть, а при ручном создании его сформирует `npm install`. Третьесторонние библиотеки не являются собственным кодом и устанавливаются npm.

```bash
npm install
npm run audio
npm run typecheck
npm test
npx expo-doctor
npx expo start --go --lan --port 0
```

`npm run audio` создаёт три необходимых бинарных WAV из полностью приведённого собственного скрипта. Их не нужно искать в интернете. В готовом комплекте WAV уже включены. Скрипт записывает PCM16 mono 22050 Hz: 8 нот по 0,8 секунды; короткая огибающая убирает резкие щелчки. Наборы нот придуманы для демонстрации, а не получены из чужих песен. Статический `require` в `App.tsx` позволяет Metro включить аудио в bundles. Поддерживаемый playback API выбран по [официальной документации expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/).

## 5. Теория и структура: как состояние доходит до экрана

```text
index.ts → App / подготовка backend
                 ↓
            Session provider + один audio player
                 ↓
          Auth или Feed / Editor / Profile
                 ↓
          Backend interface
           ↙             ↘
  demo + AsyncStorage    Firebase Auth + Realtime Database

Editor → Draft → AsyncStorage key(mode, uid)
Editor → validateDraft → publish → Artwork → подписка ленты/профиля
```

`Draft` содержит версию формата, название, songId и массив цветов. Для 16 × 16 нужно 256 элементов. Индекс ячейки вычисляется как `row * 16 + column`: например, строка 2 и столбец 3 при отсчёте с нуля дают индекс 35. В интерфейсе ячейки подписаны с единицы, поэтому эта ячейка — «Пиксель 36».

`paintPixel` сначала проверяет массив, индекс и цвет. Затем `map` возвращает новый массив. React получает новый state и перерисовывает холст; исходный массив не меняется. Очистка создаёт `emptyDraft()` и после подтверждения удаляет сохранённый черновик. Белый цвет — обычный цвет фона, поэтому он работает как ластик.

Черновик может оставаться пустым. Публикация должна иметь название и хотя бы один цветной пиксель. `validateDraft(value, true)` усиливает проверку перед публикацией. Парсер черновика ловит повреждённый JSON, показывает ошибку и не удаляет сохранённые данные молча. Пользователь может очистить их явно.

`Artwork` добавляет id, authorId, authorName и createdAt. Автор приходит из текущего сеанса. Публичные публикации не содержат email и пароля. Имена не уникальны и не подтверждают личность; идентификатор владельца — uid. В demo timestamp задаётся локальными часами, в Firebase — `serverTimestamp()`.

`useArtworks` подписывается на ленту и возвращает отписку из `useEffect`. Поэтому экран освобождает слушатель при уходе. Лента сортируется по времени, профиль выбирает текущего автора; Firebase-профиль получает отдельный запрос по authorId, а не фильтрует только 50 элементов общей ленты.

## 6. Функции и почему они нужны

| Функция/компонент | Что делает | Почему так |
|---|---|---|
| `blankPixels`, `emptyDraft` | Создают независимый пустой рисунок | Новый массив не разделяется между аккаунтами/черновиками |
| `paintPixel` | Копирует массив, меняя одну ячейку | React state остаётся неизменяемым |
| `validateCredentials` | Проверяет email, пароль 8–128 и имя 1–40 | UI и оба адаптера используют одинаковые границы |
| `validateDraft`, `parseDraft` | Проверяют формат, песню, размер и палитру | Повреждение хранения не превращается в неожиданную публикацию |
| `draftKey` | Добавляет mode и uid к ключу | Чужой аккаунт не получает черновик предыдущего пользователя |
| `buildArtwork`, `buildComment` | Добавляют автора и timestamp | authorId не вводится произвольно в форме |
| `sortedArtworks` | Сортирует копию, при необходимости фильтрует автора | Один порядок карточек в ленте и профиле |
| `toggleLike`, `assertOwner` | Переключают локальный лайк и проверяют владельца | Поведение demo соответствует выбранному сценарию |
| `queue`, `save` в demo | Сериализуют операции; меняют state после успешной записи | Параллельные нажатия и Storage error не теряют данные и не дают ложный успех |
| `createBackend` | Выбирает адаптер по EXPO_PUBLIC_BACKEND | Demo доступен без облака, Firebase остаётся настоящим отдельным режимом |
| `authPersistence` | Web storage или native AsyncStorage | Firebase-сеанс восстанавливается подходящим механизмом платформы |
| `watchAuth`, Session | Дают текущего пользователя экранам | Вход/выход пересоздают навигацию и разделяют аккаунты |
| `watchArtworks`, `useArtworks` | Подписываются, показывают loading/error, освобождают слушатели | Данные и жизненный цикл отделены от карточки |
| `runTransaction` | Переключает `/likes/uid` атомарно | Лайк не зависит от устаревшего состояния всей карточки |
| `Page`, `Action`, `PixelGrid` | Переиспользуют layout, кнопки и холст | Одинаковые состояния и меньше повторения UI |
| `ArtworkCard` | Показывает рисунок, песню, лайки и комментарии | Одна карточка работает в профиле и ленте |
| `SongControl`, `playSong` | Управляют одним общим player | Две карточки не запускают одновременно разные плееры |
| `watchConnection` | Отмечает состояние DB и запрещает новые offline writes | Локальное сохранение черновика остаётся доступным |
| Security Rules | Проверяют владельца и поля на сервере | Скрытая кнопка сама по себе не является защитой |
| `generate-audio.mjs` | Воссоздаёт включённые WAV | Самостоятельное решение без чужих записей |
| `serve-web.mjs` | Отдаёт локальный static export | Проверка browser-пакета без ещё одной runtime-зависимости |

## 7. Как самостоятельно включить Firebase

Наш код совместим с Firebase JS SDK 12+; Expo описывает этот путь для Auth/Realtime Database и Expo Go в [официальном руководстве](https://docs.expo.dev/guides/using-firebase/). Это настройка ученицы, не уже созданное облако.

1. В Firebase Console создайте или выберите собственный учебный проект и зарегистрируйте Web App. Скопируйте пять публичных значений конфигурации, включая точный databaseURL со страницы Realtime Database.
2. В Authentication включите Email/Password. Создайте Realtime Database с закрытыми правилами; не открывайте запись для всех.
3. В каталоге приложения выполните `cp .env.example .env`, переключите `EXPO_PUBLIC_BACKEND=firebase` и заполните все пять полей. Не добавляйте service-account JSON, приватные ключи или admin credentials. Expo public env встраивается в клиент; такие параметры не являются секретным серверным хранилищем.
4. Самостоятельно замените Database Rules точным содержимым `database.rules.json` через Console и опубликуйте их. Альтернативно после собственного CLI login примените именно database rules:

```bash
npx --yes firebase-tools@15 login
npx --yes firebase-tools@15 deploy --only database --project "ВАШ-PROJECT-ID"
```

5. Остановите Expo и перезапустите `npx expo start --go --lan --port 0 --clear`. Если проверяете static web export, выполните новый `npm run build`: env уже встроен в JS и старый bundle не поменяется от редактирования `.env`.
6. Создайте два учебных аккаунта и повторите сценарий из раздела ниже. Для настоящей общей ленты войдите с разных устройств в один Firebase-проект.

На web используется `browserLocalPersistence`. На Android/iOS Metro выбирает `persistence.native.ts` и использует `getReactNativePersistence(AsyncStorage)`, как в [Firebase API reference](https://firebase.google.com/docs/reference/js/auth#getreactnativepersistence). Общий `.d.ts` установленного Firebase не перечисляет этот RN export, поэтому native файл описывает его сигнатуру через namespace и проверяет наличие функции во время выполнения. TypeScript и native export проверены; окончательное подтверждение нативного сеанса требует запуска устройства.

В коде нет настройки внешних Firebase-ресурсов, тестовых администраторских паролей и автоматического deploy. Если Firebase сообщает `operation-not-allowed`, проверьте Email/Password; `permission_denied` — владелец/поля/применённые правила; `invalid-api-key` — config; ошибки сети — доступность сервисов. Приложение не выдаёт ошибку облака за успешную публикацию.

## 8. Почему Security Rules устроены так

Корень по умолчанию запрещает чтение и запись. `/artworks` читает только авторизованный участник: это общая учебная лента. Создание публикации разрешено, когда записи ещё нет и новый authorId совпадает с `auth.uid`. Готовая публикация неизменяема; удалить весь узел может только её автор. Лайки и комментарии имеют отдельные права на дочерних узлах.

Обязательны id, authorId, authorName, title, songId, pixels, createdAt. Неизвестные поля отвергаются. id должен совпадать с ключом; title/имя/комментарий имеют предел длины; songId принадлежит нашим трём песням; timestamp новой записи близок к серверному времени. На клиенте `trim()` отбрасывает все крайние пробельные символы; server regex дополнительно отвергает строки только из ASCII-пробелов. Поле pixels обязано содержать все ключи 0–255, каждый ключ ограничен этим диапазоном и каждый цвет принадлежит палитре. Поэтому дополнительные или пропущенные ячейки отвергаются.

`hasChildren` получает полный список 256 ключей намеренно: Rules API не предоставляет `numChildren()` как JS DataSnapshot. Ссылки на языковые методы и разграничение каскадных write/validate правил приведены в [Firebase Rules API](https://firebase.google.com/docs/reference/security/database) и [core syntax](https://firebase.google.com/docs/database/security/core-syntax).

Белый холст допустим как локальный Draft, но не как опубликованный Artwork. Клиент проверяет хотя бы один цветной пиксель, и сервер повторяет это условие через OR для всех 256 ячеек. Длинное выражение в rules намеренно перечисляет каждый возможный индекс; тест проверяет и полностью белый запрет, и разрешение цветного пикселя только в ячейке 255. Его можно воспроизвести через `Array.from({ length: 256 }, (_, i) => "newData.child('" + i + "').val() !== '#FFFFFF'").join(' || ')` и поместить в скобки после `hasChildren(...) &&`.

Новые правила не исправляют автоматически старые записи и административный импорт. Поэтому `decodeArtworks` дополнительно проверяет каждую полученную публикацию и её social fields в отдельном `try/catch`. Повреждённая запись не прерывает чтение соседних корректных. Callback передаёт одновременно корректные `items` и `warning`; `useArtworks` показывает их вместе. Если повреждены все записи, виден явный текст ошибки, а приглашение «Лента пока пустая» не отображается. Отсутствующая база (`null`) по-прежнему означает настоящую пустую ленту. Это проверяют отдельные regression-тесты с белой, повреждённой и корректной публикациями, а также объектом числовых ключей pixels.

Лайк записывает только соответствующий uid и только как `true`; снятие — удаление этого child. Комментарий создаётся только от собственного uid у существующей работы; удалить его может его автор. Начальное создание Artwork запрещает вкладывать заранее сфабрикованные likes/comments. Это существенный момент: разрешённая запись родителя иначе могла бы дать создателю полномочия записать чужие реакции.

Локальный Database Emulator проверяет те же правила:

```bash
java -version
npm run test:rules
```

Нужна Java 21+. Используются project `demo-soundshades` и loopback DB port из `firebase.json` (59103); никаких реальных Firebase-проектов для теста не требуется. Ожидаемые отрицательные проверки печатают `permission_denied` и всё равно заканчиваются PASS. Если порт занят, выберите другой свободный порт в `firebase.json`; тест читает конфигурацию оттуда. Не останавливайте неизвестный процесс только ради освобождения порта.

Правила не являются полной production-системой: в этом учебном объёме отсутствуют модерация, email verification, rate limiting и защита от массовой регистрации. Непустой цветной рисунок проверяется и приложением, и server rules; структура и разрешённые цвета также проверяются с обеих сторон. Production-готовность не заявлена.

## 9. Проверка своего приложения вручную

| Действие | Ожидаемый результат |
|---|---|
| Неправильный email/короткий пароль/пустое имя | Понятная ошибка, аккаунт не создаётся |
| Регистрация Алисы | Открывается лента, в профиле её имя и email |
| Вход с неверным паролем | Ошибка; чужой аккаунт не открывается |
| Выбор каждой песни, play/pause/replay | Звучит нужный WAV; виден статус; одновременно один player |
| Два цвета, белый ластик | Меняются именно выбранные ячейки |
| Публикация без названия или с белым холстом | Ошибка формы, публикации нет |
| Сохранение черновика и перезапуск | Возвращаются название, песня и пиксели |
| Отмена/подтверждение очистки | Отмена сохраняет рисунок; подтверждение удаляет рисунок и сохранённый draft |
| Публикация и профиль | Одна работа появляется в ленте и у собственного автора |
| Выход и Боб | Профиль и черновик Боба отделены, работа Алисы видна в общей ленте |
| Лайк/повторный лайк | Счётчик увеличивается/уменьшается один раз |
| Комментарий и удаление своего | Текст виден, собственный комментарий можно удалить |
| Чужая работа/чужой комментарий | Кнопка удаления отсутствует; emulator проверяет server denial |
| Удаление собственной работы | После подтверждения исчезает вместе с social data |
| Firebase offline | Новые cloud writes выключены; draft сохраняется локально; уже начатую отправку ждём до серверного подтверждения |
| Повреждённая запись рядом с корректной | `npm test` проверяет изоляцию: корректная работа сохраняется в списке, callback содержит предупреждение; all-bad не считается успешной пустой лентой |
| Узкий экран и клавиатура | Контент прокручивается, кнопки не уходят за горизонтальную границу |

Firebase SDK может локально отразить ожидающую запись в подписке. Окончательное сообщение об успехе и очистка draft наступают только после выполнения `set`/transaction. При разрыве связи посреди отправки оставьте приложение открытым и дождитесь восстановления; закрытие приложения до server ack не гарантирует сохранность незавершённой cloud-write. Для draft нажмите отдельную кнопку локального сохранения.

Текущие наблюдённые результаты записаны в VERIFICATION.md. Не заменяйте ручную проверку телефона успешным TypeScript или экспортом.

## 10. Разбор кода на защите и комплект сдачи

Покажите по порядку `App.tsx` (navigation и provider), `domain.ts` (модели и immutable редактор), `demo.ts` (local persistence), `backend.ts` (Firebase), `database.rules.json` (серверная защита), аудиогенератор и тесты. Объясните на конкретном примере переход Draft → Artwork и зачем автор определяется по сеансу. Статический export даёт bundle, а не запущенное приложение и не APK/IPA.

`docs/DEMO.md` содержит полный сценарий демонстрации и вопросы для подготовки. `docs/LEARNING_DIARY.md` — честный незаполненный шаблон: впишите свои реальные даты, затруднения, изменения, проверки, использованную помощь и выводы. Готовая реализация и наш протокол не являются личным дневником ученицы.

Черновик текста для отправки преподавателю: «Предлагаю SoundShades: приложение на Expo/TypeScript, где пользователь выбирает одну из трёх собственных коротких мелодий, рисует 16 × 16 пикселей, сохраняет черновик и публикует работу. Есть Auth, общая лента, профиль, лайки/комментарии и Firebase Rules. Подходит ли такой объём и источник музыки для final project?» Текст только подготовлен; отправка и утверждение не выполнены.

Перед сдачей разместите исходники и документацию в собственном онлайн Git-репозитории по правилам курса. Включите package-lock и WAV; исключите `node_modules`, `.expo`, `dist` и `.env`. `.gitignore` уже подготовлен. Не добавляйте административные ключи. Самостоятельный архив приложения не содержит `.git`, origin, историю или привязку к репозиторию. Зафиксируйте URL репозитория в личном дневнике, приложите требуемую документацию и покажите основной сценарий на телефоне.

## 11. Полный собственный код

Далее приведены все собственные текстовые файлы проекта целиком: приложение, модели, адаптеры, persistence, конфигурации, правила, тесты, скрипты и документы. Lock-файл и бинарные WAV не перепечатываются; lock поставляется в папке, WAV воспроизводятся включённым скриптом. Третьесторонние зависимости и сгенерированные build-файлы также не являются собственным исходным кодом.

### package.json

````json
{
  "name": "soundshades",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "main": "index.ts",
  "engines": { "node": ">=24 <25" },
  "scripts": {
    "start": "expo start",
    "ios": "expo start --ios",
    "android": "expo start --android",
    "web": "expo start --web",
    "preview": "node scripts/serve-web.mjs",
    "typecheck": "tsc --noEmit",
    "test": "node --experimental-strip-types --test tests/*.test.ts",
    "test:rules": "npx --yes firebase-tools@15 emulators:exec --project demo-soundshades --only database \"node --test tests/firebase-rules.test.mjs\"",
    "build": "expo export --platform all --output-dir dist",
    "audio": "node scripts/generate-audio.mjs",
    "check:materials": "node scripts/check-materials.mjs",
    "manual": "node scripts/build-manual.mjs"
  },
  "dependencies": {
    "@expo/metro-runtime": "~57.0.16",
    "@react-native-async-storage/async-storage": "2.2.0",
    "@react-navigation/native": "^7.1.0",
    "@react-navigation/native-stack": "^7.3.0",
    "expo": "~57.0.24",
    "expo-asset": "~57.0.18",
    "expo-audio": "~57.0.5",
    "expo-crypto": "~57.0.3",
    "firebase": "^12.0.0",
    "react": "19.2.3",
    "react-dom": "19.2.3",
    "react-native": "0.86.3",
    "react-native-safe-area-context": "~5.7.0",
    "react-native-screens": "~4.26.0",
    "react-native-web": "~0.21.0"
  },
  "devDependencies": {
    "@firebase/rules-unit-testing": "^5.0.0",
    "@types/node": "~24.0.0",
    "@types/react": "~19.2.2",
    "typescript": "~6.0.3"
  }
}
````

### app.json

````json
{
  "expo": {
    "name": "SoundShades",
    "slug": "soundshades",
    "version": "1.0.0",
    "orientation": "portrait",
    "userInterfaceStyle": "dark",
    "ios": { "supportsTablet": true },
    "android": { "predictiveBackGestureEnabled": false },
    "web": { "bundler": "metro", "output": "single" },
    "plugins": [["expo-audio", {
      "microphonePermission": false,
      "recordAudioAndroid": false,
      "enableBackgroundPlayback": false,
      "enableBackgroundRecording": false
    }]]
  }
}
````

### tsconfig.json

````json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": { "strict": true, "noEmit": true, "allowImportingTsExtensions": true, "types": ["node", "react"] },
  "include": ["**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules", "dist", "output"]
}
````

### index.ts

````typescript
import { registerRootComponent } from 'expo';
import App from './App';
registerRootComponent(App);
````

### App.tsx

````tsx
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
````

### src/domain.ts

````typescript
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
````

### src/demo.ts

````typescript
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
````

### src/backend.ts

````typescript
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
````

### src/persistence.ts

````typescript
import { browserLocalPersistence, type Persistence } from 'firebase/auth';
// Web entry; Metro выбирает persistence.native.ts на Android/iOS.
export function authPersistence(): Persistence { return browserLocalPersistence; }
````

### src/persistence.native.ts

````typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as AuthApi from 'firebase/auth';
import type { Persistence } from 'firebase/auth';
// Firebase 12 экспортирует функцию в RN entry, но общий .d.ts её не перечисляет.
// Обращение через namespace не подменяет SDK; runtime-проверка выявит неверный entry.
const nativeApi = AuthApi as typeof AuthApi & {
  getReactNativePersistence(storage: typeof AsyncStorage): Persistence;
};
export function authPersistence(): Persistence {
  if (typeof nativeApi.getReactNativePersistence !== 'function') throw new Error('Firebase RN persistence недоступен: проверьте версии Firebase/Expo.');
  return nativeApi.getReactNativePersistence(AsyncStorage);
}
````

### database.rules.json

````json
{
  "rules": {
    ".read": false,
    ".write": false,
    "artworks": {
      ".read": "auth != null",
      ".indexOn": ["createdAt", "authorId"],
      "$artworkId": {
        ".write": "auth != null && ((!data.exists() && newData.exists() && newData.child('authorId').val() === auth.uid) || (data.exists() && !newData.exists() && data.child('authorId').val() === auth.uid))",
        ".validate": "$artworkId.matches(/^[A-Za-z0-9_-]{1,80}$/) && newData.hasChildren(['id', 'authorId', 'authorName', 'title', 'songId', 'pixels', 'createdAt']) && (data.exists() || (!newData.child('likes').exists() && !newData.child('comments').exists()))",
        "id": { ".validate": "newData.isString() && newData.val() === $artworkId && (!data.exists() || newData.val() === data.val())" },
        "authorId": { ".validate": "newData.isString() && ((!data.exists() && newData.val() === auth.uid) || (data.exists() && newData.val() === data.val()))" },
        "authorName": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 40 && newData.val().matches(/.*[^ ].*/) && (!data.exists() || newData.val() === data.val())" },
        "title": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 80 && newData.val().matches(/.*[^ ].*/) && (!data.exists() || newData.val() === data.val())" },
        "songId": { ".validate": "(newData.val() === 'sunrise' || newData.val() === 'rain' || newData.val() === 'night') && (!data.exists() || newData.val() === data.val())" },
        "createdAt": { ".validate": "newData.isNumber() && ((!data.exists() && newData.val() >= now - 300000 && newData.val() <= now + 1000) || (data.exists() && newData.val() === data.val()))" },
        "pixels": {
          ".validate": "newData.hasChildren(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24', '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46', '47', '48', '49', '50', '51', '52', '53', '54', '55', '56', '57', '58', '59', '60', '61', '62', '63', '64', '65', '66', '67', '68', '69', '70', '71', '72', '73', '74', '75', '76', '77', '78', '79', '80', '81', '82', '83', '84', '85', '86', '87', '88', '89', '90', '91', '92', '93', '94', '95', '96', '97', '98', '99', '100', '101', '102', '103', '104', '105', '106', '107', '108', '109', '110', '111', '112', '113', '114', '115', '116', '117', '118', '119', '120', '121', '122', '123', '124', '125', '126', '127', '128', '129', '130', '131', '132', '133', '134', '135', '136', '137', '138', '139', '140', '141', '142', '143', '144', '145', '146', '147', '148', '149', '150', '151', '152', '153', '154', '155', '156', '157', '158', '159', '160', '161', '162', '163', '164', '165', '166', '167', '168', '169', '170', '171', '172', '173', '174', '175', '176', '177', '178', '179', '180', '181', '182', '183', '184', '185', '186', '187', '188', '189', '190', '191', '192', '193', '194', '195', '196', '197', '198', '199', '200', '201', '202', '203', '204', '205', '206', '207', '208', '209', '210', '211', '212', '213', '214', '215', '216', '217', '218', '219', '220', '221', '222', '223', '224', '225', '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241', '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255']) && (newData.child('0').val() !== '#FFFFFF' || newData.child('1').val() !== '#FFFFFF' || newData.child('2').val() !== '#FFFFFF' || newData.child('3').val() !== '#FFFFFF' || newData.child('4').val() !== '#FFFFFF' || newData.child('5').val() !== '#FFFFFF' || newData.child('6').val() !== '#FFFFFF' || newData.child('7').val() !== '#FFFFFF' || newData.child('8').val() !== '#FFFFFF' || newData.child('9').val() !== '#FFFFFF' || newData.child('10').val() !== '#FFFFFF' || newData.child('11').val() !== '#FFFFFF' || newData.child('12').val() !== '#FFFFFF' || newData.child('13').val() !== '#FFFFFF' || newData.child('14').val() !== '#FFFFFF' || newData.child('15').val() !== '#FFFFFF' || newData.child('16').val() !== '#FFFFFF' || newData.child('17').val() !== '#FFFFFF' || newData.child('18').val() !== '#FFFFFF' || newData.child('19').val() !== '#FFFFFF' || newData.child('20').val() !== '#FFFFFF' || newData.child('21').val() !== '#FFFFFF' || newData.child('22').val() !== '#FFFFFF' || newData.child('23').val() !== '#FFFFFF' || newData.child('24').val() !== '#FFFFFF' || newData.child('25').val() !== '#FFFFFF' || newData.child('26').val() !== '#FFFFFF' || newData.child('27').val() !== '#FFFFFF' || newData.child('28').val() !== '#FFFFFF' || newData.child('29').val() !== '#FFFFFF' || newData.child('30').val() !== '#FFFFFF' || newData.child('31').val() !== '#FFFFFF' || newData.child('32').val() !== '#FFFFFF' || newData.child('33').val() !== '#FFFFFF' || newData.child('34').val() !== '#FFFFFF' || newData.child('35').val() !== '#FFFFFF' || newData.child('36').val() !== '#FFFFFF' || newData.child('37').val() !== '#FFFFFF' || newData.child('38').val() !== '#FFFFFF' || newData.child('39').val() !== '#FFFFFF' || newData.child('40').val() !== '#FFFFFF' || newData.child('41').val() !== '#FFFFFF' || newData.child('42').val() !== '#FFFFFF' || newData.child('43').val() !== '#FFFFFF' || newData.child('44').val() !== '#FFFFFF' || newData.child('45').val() !== '#FFFFFF' || newData.child('46').val() !== '#FFFFFF' || newData.child('47').val() !== '#FFFFFF' || newData.child('48').val() !== '#FFFFFF' || newData.child('49').val() !== '#FFFFFF' || newData.child('50').val() !== '#FFFFFF' || newData.child('51').val() !== '#FFFFFF' || newData.child('52').val() !== '#FFFFFF' || newData.child('53').val() !== '#FFFFFF' || newData.child('54').val() !== '#FFFFFF' || newData.child('55').val() !== '#FFFFFF' || newData.child('56').val() !== '#FFFFFF' || newData.child('57').val() !== '#FFFFFF' || newData.child('58').val() !== '#FFFFFF' || newData.child('59').val() !== '#FFFFFF' || newData.child('60').val() !== '#FFFFFF' || newData.child('61').val() !== '#FFFFFF' || newData.child('62').val() !== '#FFFFFF' || newData.child('63').val() !== '#FFFFFF' || newData.child('64').val() !== '#FFFFFF' || newData.child('65').val() !== '#FFFFFF' || newData.child('66').val() !== '#FFFFFF' || newData.child('67').val() !== '#FFFFFF' || newData.child('68').val() !== '#FFFFFF' || newData.child('69').val() !== '#FFFFFF' || newData.child('70').val() !== '#FFFFFF' || newData.child('71').val() !== '#FFFFFF' || newData.child('72').val() !== '#FFFFFF' || newData.child('73').val() !== '#FFFFFF' || newData.child('74').val() !== '#FFFFFF' || newData.child('75').val() !== '#FFFFFF' || newData.child('76').val() !== '#FFFFFF' || newData.child('77').val() !== '#FFFFFF' || newData.child('78').val() !== '#FFFFFF' || newData.child('79').val() !== '#FFFFFF' || newData.child('80').val() !== '#FFFFFF' || newData.child('81').val() !== '#FFFFFF' || newData.child('82').val() !== '#FFFFFF' || newData.child('83').val() !== '#FFFFFF' || newData.child('84').val() !== '#FFFFFF' || newData.child('85').val() !== '#FFFFFF' || newData.child('86').val() !== '#FFFFFF' || newData.child('87').val() !== '#FFFFFF' || newData.child('88').val() !== '#FFFFFF' || newData.child('89').val() !== '#FFFFFF' || newData.child('90').val() !== '#FFFFFF' || newData.child('91').val() !== '#FFFFFF' || newData.child('92').val() !== '#FFFFFF' || newData.child('93').val() !== '#FFFFFF' || newData.child('94').val() !== '#FFFFFF' || newData.child('95').val() !== '#FFFFFF' || newData.child('96').val() !== '#FFFFFF' || newData.child('97').val() !== '#FFFFFF' || newData.child('98').val() !== '#FFFFFF' || newData.child('99').val() !== '#FFFFFF' || newData.child('100').val() !== '#FFFFFF' || newData.child('101').val() !== '#FFFFFF' || newData.child('102').val() !== '#FFFFFF' || newData.child('103').val() !== '#FFFFFF' || newData.child('104').val() !== '#FFFFFF' || newData.child('105').val() !== '#FFFFFF' || newData.child('106').val() !== '#FFFFFF' || newData.child('107').val() !== '#FFFFFF' || newData.child('108').val() !== '#FFFFFF' || newData.child('109').val() !== '#FFFFFF' || newData.child('110').val() !== '#FFFFFF' || newData.child('111').val() !== '#FFFFFF' || newData.child('112').val() !== '#FFFFFF' || newData.child('113').val() !== '#FFFFFF' || newData.child('114').val() !== '#FFFFFF' || newData.child('115').val() !== '#FFFFFF' || newData.child('116').val() !== '#FFFFFF' || newData.child('117').val() !== '#FFFFFF' || newData.child('118').val() !== '#FFFFFF' || newData.child('119').val() !== '#FFFFFF' || newData.child('120').val() !== '#FFFFFF' || newData.child('121').val() !== '#FFFFFF' || newData.child('122').val() !== '#FFFFFF' || newData.child('123').val() !== '#FFFFFF' || newData.child('124').val() !== '#FFFFFF' || newData.child('125').val() !== '#FFFFFF' || newData.child('126').val() !== '#FFFFFF' || newData.child('127').val() !== '#FFFFFF' || newData.child('128').val() !== '#FFFFFF' || newData.child('129').val() !== '#FFFFFF' || newData.child('130').val() !== '#FFFFFF' || newData.child('131').val() !== '#FFFFFF' || newData.child('132').val() !== '#FFFFFF' || newData.child('133').val() !== '#FFFFFF' || newData.child('134').val() !== '#FFFFFF' || newData.child('135').val() !== '#FFFFFF' || newData.child('136').val() !== '#FFFFFF' || newData.child('137').val() !== '#FFFFFF' || newData.child('138').val() !== '#FFFFFF' || newData.child('139').val() !== '#FFFFFF' || newData.child('140').val() !== '#FFFFFF' || newData.child('141').val() !== '#FFFFFF' || newData.child('142').val() !== '#FFFFFF' || newData.child('143').val() !== '#FFFFFF' || newData.child('144').val() !== '#FFFFFF' || newData.child('145').val() !== '#FFFFFF' || newData.child('146').val() !== '#FFFFFF' || newData.child('147').val() !== '#FFFFFF' || newData.child('148').val() !== '#FFFFFF' || newData.child('149').val() !== '#FFFFFF' || newData.child('150').val() !== '#FFFFFF' || newData.child('151').val() !== '#FFFFFF' || newData.child('152').val() !== '#FFFFFF' || newData.child('153').val() !== '#FFFFFF' || newData.child('154').val() !== '#FFFFFF' || newData.child('155').val() !== '#FFFFFF' || newData.child('156').val() !== '#FFFFFF' || newData.child('157').val() !== '#FFFFFF' || newData.child('158').val() !== '#FFFFFF' || newData.child('159').val() !== '#FFFFFF' || newData.child('160').val() !== '#FFFFFF' || newData.child('161').val() !== '#FFFFFF' || newData.child('162').val() !== '#FFFFFF' || newData.child('163').val() !== '#FFFFFF' || newData.child('164').val() !== '#FFFFFF' || newData.child('165').val() !== '#FFFFFF' || newData.child('166').val() !== '#FFFFFF' || newData.child('167').val() !== '#FFFFFF' || newData.child('168').val() !== '#FFFFFF' || newData.child('169').val() !== '#FFFFFF' || newData.child('170').val() !== '#FFFFFF' || newData.child('171').val() !== '#FFFFFF' || newData.child('172').val() !== '#FFFFFF' || newData.child('173').val() !== '#FFFFFF' || newData.child('174').val() !== '#FFFFFF' || newData.child('175').val() !== '#FFFFFF' || newData.child('176').val() !== '#FFFFFF' || newData.child('177').val() !== '#FFFFFF' || newData.child('178').val() !== '#FFFFFF' || newData.child('179').val() !== '#FFFFFF' || newData.child('180').val() !== '#FFFFFF' || newData.child('181').val() !== '#FFFFFF' || newData.child('182').val() !== '#FFFFFF' || newData.child('183').val() !== '#FFFFFF' || newData.child('184').val() !== '#FFFFFF' || newData.child('185').val() !== '#FFFFFF' || newData.child('186').val() !== '#FFFFFF' || newData.child('187').val() !== '#FFFFFF' || newData.child('188').val() !== '#FFFFFF' || newData.child('189').val() !== '#FFFFFF' || newData.child('190').val() !== '#FFFFFF' || newData.child('191').val() !== '#FFFFFF' || newData.child('192').val() !== '#FFFFFF' || newData.child('193').val() !== '#FFFFFF' || newData.child('194').val() !== '#FFFFFF' || newData.child('195').val() !== '#FFFFFF' || newData.child('196').val() !== '#FFFFFF' || newData.child('197').val() !== '#FFFFFF' || newData.child('198').val() !== '#FFFFFF' || newData.child('199').val() !== '#FFFFFF' || newData.child('200').val() !== '#FFFFFF' || newData.child('201').val() !== '#FFFFFF' || newData.child('202').val() !== '#FFFFFF' || newData.child('203').val() !== '#FFFFFF' || newData.child('204').val() !== '#FFFFFF' || newData.child('205').val() !== '#FFFFFF' || newData.child('206').val() !== '#FFFFFF' || newData.child('207').val() !== '#FFFFFF' || newData.child('208').val() !== '#FFFFFF' || newData.child('209').val() !== '#FFFFFF' || newData.child('210').val() !== '#FFFFFF' || newData.child('211').val() !== '#FFFFFF' || newData.child('212').val() !== '#FFFFFF' || newData.child('213').val() !== '#FFFFFF' || newData.child('214').val() !== '#FFFFFF' || newData.child('215').val() !== '#FFFFFF' || newData.child('216').val() !== '#FFFFFF' || newData.child('217').val() !== '#FFFFFF' || newData.child('218').val() !== '#FFFFFF' || newData.child('219').val() !== '#FFFFFF' || newData.child('220').val() !== '#FFFFFF' || newData.child('221').val() !== '#FFFFFF' || newData.child('222').val() !== '#FFFFFF' || newData.child('223').val() !== '#FFFFFF' || newData.child('224').val() !== '#FFFFFF' || newData.child('225').val() !== '#FFFFFF' || newData.child('226').val() !== '#FFFFFF' || newData.child('227').val() !== '#FFFFFF' || newData.child('228').val() !== '#FFFFFF' || newData.child('229').val() !== '#FFFFFF' || newData.child('230').val() !== '#FFFFFF' || newData.child('231').val() !== '#FFFFFF' || newData.child('232').val() !== '#FFFFFF' || newData.child('233').val() !== '#FFFFFF' || newData.child('234').val() !== '#FFFFFF' || newData.child('235').val() !== '#FFFFFF' || newData.child('236').val() !== '#FFFFFF' || newData.child('237').val() !== '#FFFFFF' || newData.child('238').val() !== '#FFFFFF' || newData.child('239').val() !== '#FFFFFF' || newData.child('240').val() !== '#FFFFFF' || newData.child('241').val() !== '#FFFFFF' || newData.child('242').val() !== '#FFFFFF' || newData.child('243').val() !== '#FFFFFF' || newData.child('244').val() !== '#FFFFFF' || newData.child('245').val() !== '#FFFFFF' || newData.child('246').val() !== '#FFFFFF' || newData.child('247').val() !== '#FFFFFF' || newData.child('248').val() !== '#FFFFFF' || newData.child('249').val() !== '#FFFFFF' || newData.child('250').val() !== '#FFFFFF' || newData.child('251').val() !== '#FFFFFF' || newData.child('252').val() !== '#FFFFFF' || newData.child('253').val() !== '#FFFFFF' || newData.child('254').val() !== '#FFFFFF' || newData.child('255').val() !== '#FFFFFF')",
          "$index": { ".validate": "$index.matches(/^(0|[1-9][0-9]?|1[0-9]{2}|2[0-4][0-9]|25[0-5])$/) && newData.isString() && newData.val().matches(/^#(FFFFFF|19243B|5661D8|37B7B1|F7D154|FF9065|E65B88|A980DD)$/) && (!data.exists() || newData.val() === data.val())" }
        },
        "likes": {
          "$uid": {
            ".write": "auth != null && auth.uid === $uid && root.child('artworks').child($artworkId).exists()",
            ".validate": "newData.val() === true"
          }
        },
        "comments": {
          "$commentId": {
            ".write": "auth != null && root.child('artworks').child($artworkId).exists() && ((!data.exists() && newData.child('authorId').val() === auth.uid) || (data.exists() && !newData.exists() && data.child('authorId').val() === auth.uid))",
            ".validate": "$commentId.matches(/^[A-Za-z0-9_-]{1,80}$/) && newData.hasChildren(['authorId', 'authorName', 'text', 'createdAt'])",
            "authorId": { ".validate": "newData.isString() && newData.val() === auth.uid" },
            "authorName": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 40 && newData.val().matches(/.*[^ ].*/)" },
            "text": { ".validate": "newData.isString() && newData.val().length > 0 && newData.val().length <= 300 && newData.val().matches(/.*[^ ].*/)" },
            "createdAt": { ".validate": "newData.isNumber() && newData.val() >= now - 300000 && newData.val() <= now + 1000" },
            "$other": { ".validate": false }
          }
        },
        "$other": { ".validate": false }
      }
    }
  }
}
````

### firebase.json

````json
{
  "database": { "rules": "database.rules.json" },
  "emulators": {
    "database": { "host": "127.0.0.1", "port": 59103 },
    "ui": { "enabled": false },
    "singleProjectMode": true
  }
}
````

### .env.example

````text
# По умолчанию приложение полностью работает локально.
EXPO_PUBLIC_BACKEND=demo

# Для Firebase замените режим на firebase и заполните публичную Web App config.
# Это публичные параметры клиента, а не service-account или административный ключ.
EXPO_PUBLIC_FIREBASE_API_KEY=
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=
EXPO_PUBLIC_FIREBASE_DATABASE_URL=
EXPO_PUBLIC_FIREBASE_PROJECT_ID=
EXPO_PUBLIC_FIREBASE_APP_ID=
````

### .gitignore

````text
node_modules/
.expo/
dist/
output/
.env
.env.local
.env.*.local
*-debug.log
database-debug.log
firebase-debug.log
.firebase/
.DS_Store
````

### tests/domain.test.ts

````typescript
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
````

### tests/demo.test.ts

````typescript
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
````

### tests/firebase-rules.test.mjs

````javascript
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
````

### scripts/generate-audio.mjs

````javascript
import { mkdir, writeFile } from 'node:fs/promises';

// Три оригинальные демонстрационные последовательности, PCM16 mono WAV.
// Никакие сторонние записи или фрагменты популярных песен не используются.
const melodies = {
  sunrise: [60, 64, 67, 72, 69, 67, 64, 60],
  rain: [57, 60, 64, 62, 60, 57, 55, 57],
  night: [48, 55, 58, 55, 60, 58, 55, 48],
};
const sampleRate = 22050, noteSeconds = 0.8;
const directory = new URL('../assets/audio/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const [name, notes] of Object.entries(melodies)) {
  const samples = Math.round(notes.length * noteSeconds * sampleRate);
  const buffer = Buffer.alloc(44 + samples * 2);
  buffer.write('RIFF'); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVE', 8);
  buffer.write('fmt ', 12); buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22); buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34); buffer.write('data', 36); buffer.writeUInt32LE(samples * 2, 40);
  for (let i = 0; i < samples; i++) {
    const seconds = i / sampleRate;
    const index = Math.min(Math.floor(seconds / noteSeconds), notes.length - 1);
    const local = seconds - index * noteSeconds;
    const envelope = Math.min(1, local / 0.03) * Math.max(0, Math.min(1, (noteSeconds - local) / 0.18));
    const frequency = 440 * 2 ** ((notes[index] - 69) / 12);
    const wave = Math.sin(2 * Math.PI * frequency * local) + 0.15 * Math.sin(4 * Math.PI * frequency * local);
    buffer.writeInt16LE(Math.round(6500 * envelope * wave), 44 + i * 2);
  }
  await writeFile(new URL(`${name}.wav`, directory), buffer);
  console.log(`${name}.wav: ${buffer.length} bytes, ${(samples / sampleRate).toFixed(1)} s`);
}
````

### scripts/serve-web.mjs

````javascript
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, relative, extname, isAbsolute } from 'node:path';

const directory = fileURLToPath(new URL('../dist/', import.meta.url));
const port = Number(process.argv[2] ?? '8077');
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Укажите порт от 1024 до 65535.');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'application/javascript', '.json': 'application/json', '.png': 'image/png', '.wav': 'audio/wav', '.ico': 'image/x-icon', '.css': 'text/css' };
const server = createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405); response.end(); return; }
    const pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname);
    const path = resolve(directory, `.${pathname}`), inside = relative(directory, path);
    if (isAbsolute(inside) || inside.startsWith('..') || inside.split(/[\\/]/).some((part) => part.startsWith('.'))) { response.writeHead(403); response.end(); return; }
    let target = path;
    try { if ((await stat(target)).isDirectory()) target = resolve(target, 'index.html'); }
    catch { if (!extname(pathname)) target = resolve(directory, 'index.html'); }
    const body = await readFile(target);
    response.writeHead(200, { 'Content-Type': types[extname(target)] ?? 'application/octet-stream', 'Content-Length': body.length, 'Cache-Control': 'no-store' });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch { response.writeHead(404); response.end('Not found. Run npm run build first.'); }
});
server.listen(port, '127.0.0.1', () => console.log(`SoundShades preview: http://127.0.0.1:${port}`));
````

### scripts/build-manual.mjs

````javascript
import { access, mkdir, readFile, writeFile } from 'node:fs/promises';

const project = new URL('../', import.meta.url);
const ownFiles = [
  'package.json', 'app.json', 'tsconfig.json', 'index.ts', 'App.tsx',
  'src/domain.ts', 'src/demo.ts', 'src/backend.ts', 'src/persistence.ts', 'src/persistence.native.ts',
  'database.rules.json', 'firebase.json', '.env.example', '.gitignore',
  'tests/domain.test.ts', 'tests/demo.test.ts', 'tests/firebase-rules.test.mjs',
  'scripts/generate-audio.mjs', 'scripts/serve-web.mjs', 'scripts/build-manual.mjs', 'scripts/check-materials.mjs',
  'README.md', 'docs/ASSIGNMENT.md', 'docs/DEMO.md', 'docs/LEARNING_DIARY.md', 'VERIFICATION.md', 'docs/MANUAL_SOURCE.md',
];
const source = await readFile(new URL('docs/MANUAL_SOURCE.md', project), 'utf8');
const files = await Promise.all(ownFiles.map(async (path) => {
  const contents = await readFile(new URL(path, project), 'utf8');
  const language = path.endsWith('.tsx') ? 'tsx' : path.endsWith('.ts') ? 'typescript'
    : path.endsWith('.mjs') ? 'javascript' : path.endsWith('.json') ? 'json' : path.endsWith('.md') ? 'markdown' : 'text';
  const fence = '`'.repeat(Math.max(4, ...Array.from(contents.matchAll(/`+/g), (match) => match[0].length + 1)));
  return `\n### ${path}\n\n${fence}${language}\n${contents.trimEnd()}\n${fence}\n`;
}));
const render = (assignment, readme, verification) => source
  .replaceAll('{{ASSIGNMENT_LINK}}', assignment).replaceAll('{{README_LINK}}', readme)
  .replaceAll('{{VERIFICATION_LINK}}', verification) + files.join('');
await mkdir(new URL('docs/', project), { recursive: true });
await writeFile(new URL('docs/MANUAL.md', project), render('ASSIGNMENT.md', '../README.md', '../VERIFICATION.md'), 'utf8');
console.log(`docs/MANUAL.md: full contents of ${ownFiles.length} own text files`);
// Полный комплект имеет assignments рядом с solutions. В самостоятельном ZIP
// приложение генерирует только собственный MANUAL, не создавая чужой parent tree.
try {
  await access(new URL('../../assignments/final-mobile-soundshades.md', project));
  await writeFile(new URL('../../guides/final-mobile-soundshades.md', project),
    render('../assignments/final-mobile-soundshades.md', '../solutions/soundshades/README.md', '../solutions/soundshades/VERIFICATION.md'), 'utf8');
  console.log('guides/final-mobile-soundshades.md: synchronized');
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
  console.log('Standalone project: external guide was not written.');
}
````

### scripts/check-materials.mjs

````javascript
import assert from 'node:assert/strict';
import { access, readFile, readdir } from 'node:fs/promises';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { dirname, resolve } from 'node:path';

const project = new URL('../', import.meta.url);
const ignored = new Set(['node_modules', 'dist', 'output', '.expo', '.git', '.firebase']);
async function ownFiles(directory = project, prefix = '') {
  const result = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (ignored.has(entry.name)) continue;
    const name = `${prefix}${entry.name}`;
    if (entry.isDirectory()) result.push(...await ownFiles(new URL(`${entry.name}/`, directory), `${name}/`));
    else if (entry.isFile() && (/(\.tsx?|\.mjs|\.json|\.md)$/.test(name) || ['.gitignore', '.env.example'].includes(name))
      && !['package-lock.json', 'docs/MANUAL.md'].includes(name)) result.push(name);
  }
  return result;
}
function visibleMarkdown(contents) {
  let fence = null;
  const visible = [];
  for (const line of contents.split(/\r?\n/)) {
    const marker = line.match(/^ {0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) fence = marker[1];
      else if (marker[1][0] === fence[0] && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      continue;
    }
    if (!fence) visible.push(line);
  }
  assert.equal(fence, null, 'Unclosed Markdown fence');
  return visible.join('\n');
}
const files = await ownFiles();
const manuals = [new URL('docs/MANUAL.md', project)];
try { await access(new URL('../../assignments/final-mobile-soundshades.md', project)); manuals.push(new URL('../../guides/final-mobile-soundshades.md', project)); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
for (const manual of manuals) {
  const contents = await readFile(manual, 'utf8');
  visibleMarkdown(contents);
  for (const name of files) {
    const code = (await readFile(new URL(name, project), 'utf8')).trimEnd();
    assert.ok(contents.includes(`### ${name}\n`) && contents.includes(`\n${code}\n`), `Missing full contents: ${name}`);
  }
  console.log(`${fileURLToPath(manual)}: ${files.length}/${files.length} full own files, fences PASS`);
}
let links = 0;
const markdownFiles = files.filter((name) => name.endsWith('.md') && name !== 'docs/MANUAL_SOURCE.md').map((name) => new URL(name, project));
for (const file of [...markdownFiles, ...manuals]) {
  const contents = visibleMarkdown(await readFile(file, 'utf8'));
  for (const match of contents.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
    const target = match[1].replace(/^<|>$/g, '').split('#')[0];
    if (!target || /^[a-z]+:/i.test(target)) continue;
    await access(pathToFileURL(resolve(dirname(fileURLToPath(file)), decodeURIComponent(target)))); links++;
  }
}
console.log(`Local Markdown links: ${links} PASS`);
for (const name of ['sunrise', 'rain', 'night']) {
  const wav = await readFile(new URL(`assets/audio/${name}.wav`, project));
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF'); assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(20), 1); assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt32LE(24), 22050); assert.equal(wav.readUInt16LE(34), 16);
  assert.equal(wav.readUInt32LE(40), wav.length - 44);
  assert.equal((wav.length - 44) / 2 / 22050, 6.4);
  let peak = 0; for (let index = 44; index < wav.length; index += 2) peak = Math.max(peak, Math.abs(wav.readInt16LE(index)));
  assert.ok(peak > 0 && peak < 32767);
  console.log(`${name}.wav: PCM16 mono 22050 Hz, 6.4s, peak ${peak}, PASS`);
}
````

### README.md

````markdown
# SoundShades

Готовая учебная реализация mobile final: пользователь выбирает собственную короткую мелодию, рисует пиксель-арт 16 × 16 и публикует его. Есть регистрация, вход, выход, палитра, очистка, локальный черновик, лента, профиль, лайки, комментарии и удаление своих записей.

Тема взята из идеи в исходном задании. Её утверждение преподавателем не подтверждено. Онлайн-репозиторий и личный дневник ученицы в этой локальной поставке не созданы.

## Быстрый запуск на Mac

Распакуйте папку `soundshades` в `<локальный-путь>`. Нужен Node.js 24.x, npm и доступ в интернет для первой установки.

```bash
cd <папка-этого-репозитория>
node --version
npm ci
npm run typecheck
npm test
npx expo start --go --lan --port 0
```

На Mac с Xcode нажмите `i` для iOS Simulator. На телефоне с совместимым Expo Go откройте QR-код, находясь в той же сети. Metro должен оставаться запущенным. Это инструкция для будущего запуска; телефон и macOS в текущей проверке не использовались.

По умолчанию `.env` не требуется: работает `demo`. Для браузера: `npm run web`. Для готового статического web-пакета: `npm run build`, затем `npm run preview -- 8077` и `http://127.0.0.1:8077`.

## Два режима

| Режим | Что делает |
|---|---|
| `demo` | Сохраняет аккаунты, публикации и сеанс локально; два разных аккаунта на одном устройстве видят общую локальную ленту |
| `firebase` | Использует настоящий Firebase Auth и Realtime Database после вашей настройки `.env` и установки правил |

Demo не является безопасной production-авторизацией: пользователь устройства может изменить AsyncStorage, хеши и сеанс. Пароли в открытом виде не сохраняются; salted SHA-256 здесь лишь убирает plaintext из учебного хранилища. Demo не синхронизирует разные устройства или разные browser origins. Используйте вымышленные email и отдельные учебные пароли.

Firebase-режим не переключается тайно на demo при ошибке. Заполните все пять публичных параметров из `.env.example`, включите Email/Password, создайте Realtime Database и самостоятельно примените `database.rules.json`. Административные ключи и service-account JSON приложению не нужны. Облачная среда для этого комплекта не создавалась.

## Документы и проверки

- [Полный русский мануал, создание с нуля и весь собственный код](MANUAL.md)
- [Условие и границы требований](ASSIGNMENT.md)
- [Сценарий демонстрации и разбор кода](DEMO.md)
- [Пустой шаблон личного дневника](LEARNING_DIARY.md)
- [Фактически выполненные проверки и ограничения](../VERIFICATION.md)

```bash
npm run typecheck
npm test
npx expo-doctor
npm run build
npm run check:materials
```

Для проверки Security Rules локально нужен Java 21+ и первая загрузка Firebase CLI/эмулятора:

```bash
npm run test:rules
```

Команда использует `demo-soundshades`, loopback и локальный Database Emulator; облачных записей она не создаёт. Порт задаётся в `firebase.json`, а тест читает его из этого файла. `npm run audio` воспроизводит три включённых WAV; `npm run manual` воспроизводит оба полных мануала в структуре исходного комплекта.

Бинарный экспорт в `dist` — JS/Hermes bundles и assets, а не подписанные IPA/APK. Не включайте `node_modules`, `.expo`, `dist` и `.env` в сдаваемые исходники. Сохраните `package-lock.json` и WAV.
````

### docs/ASSIGNMENT.md

````markdown
# Условие Mobile Programming final

Источник комплекта: `sources/final_tasks.pdf`, страница 1. В самостоятельном архиве приложения приводится транскрипция существенного условия; PDF находится в исходном комплекте заданий.

## Требования преподавателя

The final project is a mobile application of your own topic. The topic has to be sent for approval to the teacher to make sure in advance that it fulfills the final project requirements and on the other hand is not overly laborious.

Final project submission consists of:

- source code and documentation in a Git repository online;
- learning diary;
- demonstration of the application including review of the implementation: component structure, used features, code walkthrough.

The extent of the application, the variety of used technologies and level of finishing affect the grading.

Projects from previous courses: https://juhahinkula.github.io/hhmobile/

## Идея из документа

SoundShades: пользователи рисуют пиксель-арт о том, как чувствуют песню, и делятся работами. Другие смотрят рисунок и слушают песню. Предлагаются регистрация и вход, выбор песни, редактор, публикация в ленте и свои работы в профиле. Лайки и комментарии отмечены вопросом.

В блоке идеи перечислены React Native + Expo, Firebase Auth + Realtime Database, React Navigation, Axios, AsyncStorage, Expo Camera, Expo Notifications и React Native Paper. Обязательность каждой библиотеки не подтверждена. Это одна итоговая работа, а не десять самостоятельных заданий.

## Что реализовано по нашему выбору

Используются Expo TypeScript, React Navigation, Firebase JS SDK и AsyncStorage. Размер 16 × 16, восемь цветов и три процедурно синтезированные оригинальные WAV по 6,4 секунды — принятый объём реализации, а не числа из задания. Лайки и комментарии добавлены. Camera, Notifications, Axios и Paper не получили пользовательского сценария в выбранном объёме и не добавлялись.

## Что в исходных материалах неизвестно

- Утверждена ли тема преподавателем.
- Точный срок сдачи и количественная шкала оценки.
- Требуется ли слушать полноценные коммерческие песни вместо собственных демонстрационных мелодий.
- Какой конкретный преподавательский формат дневника и длительность демонстрации требуется.

Для сдачи ученица должна получить утверждение темы, создать онлайн-репозиторий по правилам курса, заполнить собственный дневник реальными событиями и показать приложение на мобильном устройстве. Эти внешние и личные действия не подменены вымышленными записями.

[Полное решение](MANUAL.md) · [Демонстрация](DEMO.md)
````

### docs/DEMO.md

````markdown
# SoundShades — демонстрация и защита

Это сценарий будущей демонстрации. Факт выполнения конкретных проверок описывается отдельно в `../VERIFICATION.md`.

## Сценарий приложения

1. Запустить проект. Показать режим в верхней части экрана: `ЛОКАЛЬНЫЙ DEMO` или `FIREBASE`.
2. Зарегистрировать Алису с вымышленным email `alice@example.test` и отдельным учебным паролем. Показать ошибку неверной формы и успешную регистрацию.
3. Перейти в «Рисовать». Выбрать одну из трёх мелодий, нажать «Слушать», затем паузу. Объяснить, что WAV созданы процедурно для этой работы.
4. Выбрать два цвета и закрасить несколько ячеек. Белым стереть одну ячейку. Ввести название «Тёплый рассвет».
5. Сохранить черновик, перезапустить приложение и открыть редактор. Показать восстановленные песню, название и пиксели. Показать отмену очистки.
6. Опубликовать работу. Найти её в ленте, прослушать мелодию у карточки и показать ту же работу в своём профиле.
7. Выйти. Попробовать неверный пароль. Зарегистрировать Боба; его профиль пуст, но в общей ленте видна Алиса.
8. Поставить и снять лайк, затем поставить его снова. Оставить комментарий. У Боба нет кнопки удаления работы Алисы. Свой комментарий он может удалить.
9. Войти снова как Алиса. Показать комментарий Боба и отсутствие кнопки удаления чужого комментария. Удалить собственную работу после подтверждения: она исчезает из ленты и профиля.
10. В Firebase-режиме дополнительно показать два устройства/независимых браузера, потерю сети и локальное сохранение черновика. Не объявлять запись отправленной до подтверждения сервера. Проверить чужие записи через эмулятор, а не только отсутствие кнопки.

Для demo оба аккаунта создаются в одном приложении или одном browser origin. Перенос между устройствами и localhost/127.0.0.1 не поддерживается. Для Firebase должны быть заранее настроены сервисы и правила.

## Разбор реализации

| Что показать | Что объяснить |
|---|---|
| `index.ts`, `App.tsx` | Точка входа, provider, auth navigation и экраны |
| `PixelGrid`, `paintPixel` | Индекс `row * 16 + column`; новый массив вместо мутации state |
| `Draft`, `Artwork`, `Comment` | Почему черновик допускает пустое название, а публикация — нет |
| `draftKey`, EditorScreen | Разделение черновиков по режиму и uid, восстановление и ошибки JSON |
| `createDemoBackend`, `queue`, `save` | Локальный адаптер и commit после успешной записи; ограниченная безопасность |
| `createBackend`, native persistence | Один интерфейс для двух режимов, публичный config, разные persistence entry |
| `watchArtworks`, `useArtworks` | Подписка, сортировка, фильтр профиля, отписка |
| `runTransaction` | Лайк принадлежит uid; повторное нажатие переключает true/null |
| `database.rules.json` | Авторизация, неизменяемая публикация, owner delete, строго 256 ключей и палитра |
| `generate-audio.mjs`, SongControl | Заголовок PCM WAV, синус и огибающая, один общий плеер |
| `tests`, `VERIFICATION.md` | Что доказали тесты/экспорт и что требует телефона/облака |

## Вопросы для подготовки

Почему state нельзя менять напрямую? Чем черновик отличается от публикации? Почему AsyncStorage нельзя считать доверенной авторизацией? Что проверяет сервер, даже если убрать кнопки из UI? Зачем timestamp задаётся сервером? Почему входящий uid не берётся из формы? Что происходит с подпиской после ухода с экрана? Чем export отличается от APK/IPA? Как повторно создать WAV без чужих файлов? Какие действия остались перед реальной сдачей?

Ответы и полный код находятся в [MANUAL.md](MANUAL.md).
````

### docs/LEARNING_DIARY.md

````markdown
# Личный дневник обучения — шаблон

Этот дневник пока не заполнен ученицей. Он не утверждает, что она самостоятельно выполнила подготовку реализации, тестирование или запуск. Вносите реальные даты, действия, трудности и выводы, соблюдая требования преподавателя к помощи и заимствованиям.

| Дата | Цель занятия | Что я сделала | Проблема и её причина | Как решила и проверила | Что поняла | Следующий шаг |
|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |

## Запись для каждого этапа

- Дата и затраченное время: ___
- Что хотела получить: ___
- Что сделала и какой код разбирала: ___
- Что не получилось; фактическая ошибка: ___
- Какие источники или помощь использовала: ___
- Что изменила и как проверила: ___
- Что теперь могу объяснить своими словами: ___
- Оставшийся вопрос: ___

## Итог после личного запуска

- Подтверждение темы преподавателем: ___
- URL собственного онлайн-репозитория: ___
- Устройство и версия ОС для демонстрации: ___
- Проверенные сценарии и их результаты: ___
- Ограничения и идеи следующей версии: ___
````

### VERIFICATION.md

````markdown
# SoundShades — протокол проверки

Проверка выполнена 2026-10-05 на Windows. Node.js 24.21.0, npm 11.19.0, Java 21.0.2. Фактические зависимости зафиксированы в `package-lock.json`.

| Проверка | Наблюдённый результат |
|---|---|
| Red перед реализацией | Тест нового холста упал: `0 !== 256`, 0 passed / 1 failed |
| Red перед исправлением чтения ленты | Mixed invalid+valid regression: 0 passed / 1 failed; прежний общий map выбрасывал «Нарисуйте хотя бы один цветной пиксель» и не возвращал корректную публикацию |
| Финальный `npm test` | 24 passed / 0 failed: pure domain и локальный адаптер; три новых regression проверяют mixed/all-bad feed и numeric-key pixels с повреждёнными social fields |
| `npm run typecheck` | PASS, TypeScript без ошибок |
| Финальный `npx expo-doctor` | PASS после исправления чтения ленты, 21/21 checks; первый прогон обнаружил отсутствующий прямой peer `expo-asset`, зависимость добавлена |
| Финальный `npm run build` | PASS после исправления чтения ленты; web 512 modules, iOS 864, Android 839; web JS и native Hermes bundles созданы, три WAV включены в assets |
| `npm run audio` | Созданы три PCM16 mono WAV, 22050 Hz, по 282284 байта и 6,4 секунды |
| Финальный `npm run test:rules` | PASS, 10 passed / 0 failed на Database Emulator v4.11.2; отрицательные случаи действительно получают permission_denied; новый тест запрещает 256 белых пикселей и разрешает цветную ячейку 255 |
| Web UI walkthrough, проверено главным агентом | PASS: Алиса зарегистрировалась → два жёлтых пикселя и название → сохранение draft → reload → восстановлены название и первые две ячейки rgb(247,209,84) → публикация в Feed/Profile → logout; Боб зарегистрировался → видит работу Алисы без Delete → ставит лайк, счётчик 1 |
| Узкий Web UI, проверено главным агентом | PASS: Auth и Editor при viewport width 320 имеют scrollWidth 320; ровно 256 пиксельных controls; screenshots глазами просмотрены |
| `npm run check:materials` | PASS: оба мануала содержат 27/27 собственных текстовых файлов целиком; Markdown fences закрыты; 14 локальных ссылок доступны; три WAV проходят проверку заголовка, длительности и ненулевого peak 6766 |
| Отображение мануала | Markdown отрендерен через marked/Playwright: 39 headings, 35 pre blocks; глазами просмотрены начало при 1200×900, фрагмент source code и начало при 390×844; на узком preview scrollWidth = innerWidth = 390 |

Первый запуск правил выявил несовместимые `numChildren` и `\S` в Database Emulator. В итоговых правилах все ключи 0–255 перечислены в `hasChildren`, а regex допускает только ключи этого диапазона; пустые строки и ASCII-пробелы проверяются поддерживаемым выражением. Чужой процесс на порту 9010 не останавливался: собственный Database Emulator переведён на 59103.

Исправлен выявленный при независимой проверке дефект: белая/повреждённая Firebase-публикация могла прервать общий `map` и скрыть корректные работы. Теперь каждая запись валидируется отдельно; корректные отображаются с предупреждением о пропусках. All-bad возвращает предупреждение и не отображает успешное пустое состояние. Новые server rules запрещают белую публикацию, но пустой локальный Draft по-прежнему допустим. После исправления заново выполнены TypeScript, все 24 pure/demo tests, все 10 Rules tests, Expo Doctor и export трёх платформ. Браузерный сценарий выше выполнен до этого исправления; UI предупреждения отдельно не проверялся, его данные и ветвление покрыты regression и code review.

Комментарии и воспроизведение аудио через браузер отдельно не были доведены до наблюдённого результата; для комментариев проверены core/demo flow и Rules, для WAV — формат и ненулевые samples. Нативное воспроизведение не проверено. Собственные build/test процессы завершились; `emulators:exec` явно остановил свой Database Emulator после PASS. Чужие процессы и браузерные сессии не закрывались при исправлении.

Не выполнены: запуск на macOS, iOS Simulator, Android Emulator или реальном телефоне; облачный Firebase-проект с реальными настройками; подписанная APK/IPA; публикация в онлайн Git-репозитории; утверждение темы преподавателем; личное заполнение дневника ученицей. Native export доказывает сборку bundles, но не поведение устройства и не production-готовность.

Demo доступен только одному устройству/browser origin. Пароли не хранятся plaintext; salted SHA-256 и локальный uid не являются production-защитой. Firebase-правила относятся к учебному общему приложению: имена не уникальны, нет проверки email, модерации и защиты от массовой регистрации. В Firebase лента ограничена 50 последними работами, профиль — 100; в demo показывается весь локальный набор.
````

### docs/MANUAL_SOURCE.md

````markdown
# Mobile final — SoundShades: полное решение и мануал

Условие (исходная общая ссылка вне этого пакета) · README приложения (исходная общая ссылка вне этого пакета) · Фактические проверки (исходная общая ссылка вне этого пакета)

## 1. Какие требования нужно выполнить

Преподаватель просит одну итоговую мобильную работу: собственную тему предварительно направить на утверждение, реализовать приложение, разместить исходники и документацию в онлайн Git-репозитории, вести личный learning diary и продемонстрировать приложение с обзором компонентов, возможностей и кода. Масштаб, разнообразие технологий и качество завершения влияют на оценку. Точный срок и шкала баллов в исходном материале отсутствуют.

В документе предложен SoundShades: нарисовать цветовое впечатление от песни и поделиться им. Тема преподавателем пока не подтверждена. Этот комплект реализует предложение полностью в выбранном учебном объёме; он не утверждает, что внешнее согласование, публикация репозитория или личный дневник уже выполнены.

Предполагаемый уровень — ученица, знакомая с основами JavaScript/TypeScript, React-компонентами, props и state. Руководство объясняет промежуточные переходы. Если какая-то тема пока новая, сначала запустите demo, затем изучите чистую логику и только после неё Firebase.

Маршрут: требования → запуск demo → разбор моделей и редактора → локальное сохранение → публикация/лента/профиль → лайки и комментарии → настройка Firebase и правила → проверки → личный дневник, онлайн-репозиторий и демонстрация телефона. Ниже дан весь собственный исходный код, а не только отдельные примеры.

## 2. Что получилось и какие решения приняты

| Функция | Реализация и смысл |
|---|---|
| Регистрация, вход, выход | Проверяем форму; demo хранит соль и хеш, Firebase использует Email/Password |
| Выбор музыки | Три собственные процедурные WAV по 6,4 секунды доступны офлайн и из карточек ленты |
| Редактор | 16 × 16 ячеек, восемь цветов, белый ластик, очистка с подтверждением |
| Черновик | AsyncStorage; отдельный ключ для режима и uid; сохранение по кнопке и восстановление при открытии редактора |
| Публикация | Название 1–80 символов, известная песня и цветной рисунок; автор берётся из сеанса |
| Лента | Все локальные работы в demo; последние 50 общих работ в Firebase |
| Чтение повреждённых данных | `decodeArtworks` проверяет каждую Firebase-запись отдельно: неверные публикации пропускаются с предупреждением, корректные остаются видны |
| Профиль | Собственные работы; в Firebase до 100 последних собственных публикаций |
| Лайки | Каждый uid включает/снимает собственный лайк; в Firebase используется transaction |
| Комментарии | Текст 1–300 символов; автор может удалить свой комментарий |
| Удаление работы | Только автор; подтверждение; вместе с ней удаляются её лайки и комментарии |
| Навигация | React Navigation: Auth, Feed, Editor, Profile |
| Проверки | Pure logic, demo adapter, Security Rules Emulator, TypeScript, Expo Doctor и export |

Размер сетки, палитра и набор мелодий — наши решения для завершённого объёма. Лайки и комментарии были вопросом в идее и здесь реализованы. Перечень библиотек из идеи не превращён в обязательное условие. Camera и Notifications не имеют нужного действия пользователя в выбранном сценарии; Axios не нужен для Firebase SDK, Paper не нужен для используемых компонентов. Вместо них добавлены только реально используемые зависимости.

Demo честно обозначен прямо в интерфейсе. Его аккаунты, сеанс и общая лента существуют на одном устройстве или одном browser origin. Данные можно подменить в AsyncStorage: это учебная имитация входа, а не production-auth и не multi-device. Пароль в открытом виде не сохраняется; однократный salted SHA-256 не заменяет безопасное серверное хранение паролей. Для demo берите вымышленные email и отдельные учебные пароли.

Firebase-режим использует настоящий JS SDK Auth и Realtime Database и требует вашей настройки. При ошибке конфигурации приложение сообщает об ошибке и не подменяет Firebase локальным режимом. Облако, реальный телефон, macOS и signed native binaries не объявляются проверенными на основании Windows export.

## 3. Запуск готовой папки на Mac ученицы

Путь проекта:

```text
<локальный-путь>
```

В ZIP должна лежать папка `soundshades` с `package.json`, `package-lock.json`, `App.tsx`, `src`, `assets`, `scripts`, `tests`, `docs` и конфигурациями. Node.js нужен версии 24.x. Проверьте `node --version`; если Node отсутствует, установите Node 24 для macOS с [официального сайта Node.js](https://nodejs.org/en/download). Если nvm уже установлен в вашей оболочке, можно выполнить `nvm install 24` и `nvm use 24`.

Откройте Terminal:

```bash
cd <папка-этого-репозитория>
node --version
npm --version
npm ci
npm run typecheck
npm test
npx expo start --go --lan --port 0
```

`npm ci` устанавливает именно версии из lock-файла. Обычный `npm install` при создании нового проекта сформирует новый lock; для готового комплекта предпочтителен `npm ci`. Первой установке нужен интернет. Node/npm не устанавливаются в проект как дополнительная копия, а Python для этого приложения не требуется.

Оставьте Metro работающим. На Mac с установленным Xcode нажмите `i` для iOS Simulator; на телефоне откройте QR-код в совместимом с Expo SDK 57 Expo Go, находясь в одной сети с Mac. Для Android можно использовать устройство с Expo Go или установленный Android Emulator. Для блокирующей LAN сети альтернативой служит `npx expo start --go --tunnel --port 0`; это может потребовать дополнительной загрузки инструмента туннеля. Сразу считайте запуск успешным только после появления рабочего экрана устройства. Возможности CLI описаны в [документации Expo CLI](https://docs.expo.dev/more/expo-cli/).

`.env` для demo не нужен. В браузере запустите `npm run web`. Этот путь полезен для проверки форм и данных, но не доказывает работу нативного аудио, safe areas или экранной клавиатуры телефона. Хранилище браузера зависит от протокола, хоста и порта: `localhost` и `127.0.0.1` не делят demo-аккаунты.

Статический web-preview после сборки:

```bash
npm run build
npm run preview -- 8077
```

Откройте `http://127.0.0.1:8077`. Preview работает только на loopback и предназначен для этой локальной проверки. Остановите его `Ctrl+C`. `build` экспортирует JS/Hermes bundles для web/iOS/Android и assets; он не создаёт подписанную APK или IPA.

## 4. Создание с нуля, если хотите воспроизвести решение

Это приложение не зависит от скрытого starter-кода. Если папка `soundshades` уже существует, используйте её или выберите отдельную копию для учебного воспроизведения: следующие команды рассчитаны на новый каталог, а не на замену ваших файлов.

```bash
cd <папка-этого-репозитория>
mkdir soundshades
cd soundshades
mkdir -p src tests scripts assets/audio docs
```

Создайте файлы по разделу «Полный собственный код» ниже, сохраняя их имена и каталоги. `package-lock.json` не перепечатывается в мануале: при работе из ZIP он уже есть, а при ручном создании его сформирует `npm install`. Третьесторонние библиотеки не являются собственным кодом и устанавливаются npm.

```bash
npm install
npm run audio
npm run typecheck
npm test
npx expo-doctor
npx expo start --go --lan --port 0
```

`npm run audio` создаёт три необходимых бинарных WAV из полностью приведённого собственного скрипта. Их не нужно искать в интернете. В готовом комплекте WAV уже включены. Скрипт записывает PCM16 mono 22050 Hz: 8 нот по 0,8 секунды; короткая огибающая убирает резкие щелчки. Наборы нот придуманы для демонстрации, а не получены из чужих песен. Статический `require` в `App.tsx` позволяет Metro включить аудио в bundles. Поддерживаемый playback API выбран по [официальной документации expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/).

## 5. Теория и структура: как состояние доходит до экрана

```text
index.ts → App / подготовка backend
                 ↓
            Session provider + один audio player
                 ↓
          Auth или Feed / Editor / Profile
                 ↓
          Backend interface
           ↙             ↘
  demo + AsyncStorage    Firebase Auth + Realtime Database

Editor → Draft → AsyncStorage key(mode, uid)
Editor → validateDraft → publish → Artwork → подписка ленты/профиля
```

`Draft` содержит версию формата, название, songId и массив цветов. Для 16 × 16 нужно 256 элементов. Индекс ячейки вычисляется как `row * 16 + column`: например, строка 2 и столбец 3 при отсчёте с нуля дают индекс 35. В интерфейсе ячейки подписаны с единицы, поэтому эта ячейка — «Пиксель 36».

`paintPixel` сначала проверяет массив, индекс и цвет. Затем `map` возвращает новый массив. React получает новый state и перерисовывает холст; исходный массив не меняется. Очистка создаёт `emptyDraft()` и после подтверждения удаляет сохранённый черновик. Белый цвет — обычный цвет фона, поэтому он работает как ластик.

Черновик может оставаться пустым. Публикация должна иметь название и хотя бы один цветной пиксель. `validateDraft(value, true)` усиливает проверку перед публикацией. Парсер черновика ловит повреждённый JSON, показывает ошибку и не удаляет сохранённые данные молча. Пользователь может очистить их явно.

`Artwork` добавляет id, authorId, authorName и createdAt. Автор приходит из текущего сеанса. Публичные публикации не содержат email и пароля. Имена не уникальны и не подтверждают личность; идентификатор владельца — uid. В demo timestamp задаётся локальными часами, в Firebase — `serverTimestamp()`.

`useArtworks` подписывается на ленту и возвращает отписку из `useEffect`. Поэтому экран освобождает слушатель при уходе. Лента сортируется по времени, профиль выбирает текущего автора; Firebase-профиль получает отдельный запрос по authorId, а не фильтрует только 50 элементов общей ленты.

## 6. Функции и почему они нужны

| Функция/компонент | Что делает | Почему так |
|---|---|---|
| `blankPixels`, `emptyDraft` | Создают независимый пустой рисунок | Новый массив не разделяется между аккаунтами/черновиками |
| `paintPixel` | Копирует массив, меняя одну ячейку | React state остаётся неизменяемым |
| `validateCredentials` | Проверяет email, пароль 8–128 и имя 1–40 | UI и оба адаптера используют одинаковые границы |
| `validateDraft`, `parseDraft` | Проверяют формат, песню, размер и палитру | Повреждение хранения не превращается в неожиданную публикацию |
| `draftKey` | Добавляет mode и uid к ключу | Чужой аккаунт не получает черновик предыдущего пользователя |
| `buildArtwork`, `buildComment` | Добавляют автора и timestamp | authorId не вводится произвольно в форме |
| `sortedArtworks` | Сортирует копию, при необходимости фильтрует автора | Один порядок карточек в ленте и профиле |
| `toggleLike`, `assertOwner` | Переключают локальный лайк и проверяют владельца | Поведение demo соответствует выбранному сценарию |
| `queue`, `save` в demo | Сериализуют операции; меняют state после успешной записи | Параллельные нажатия и Storage error не теряют данные и не дают ложный успех |
| `createBackend` | Выбирает адаптер по EXPO_PUBLIC_BACKEND | Demo доступен без облака, Firebase остаётся настоящим отдельным режимом |
| `authPersistence` | Web storage или native AsyncStorage | Firebase-сеанс восстанавливается подходящим механизмом платформы |
| `watchAuth`, Session | Дают текущего пользователя экранам | Вход/выход пересоздают навигацию и разделяют аккаунты |
| `watchArtworks`, `useArtworks` | Подписываются, показывают loading/error, освобождают слушатели | Данные и жизненный цикл отделены от карточки |
| `runTransaction` | Переключает `/likes/uid` атомарно | Лайк не зависит от устаревшего состояния всей карточки |
| `Page`, `Action`, `PixelGrid` | Переиспользуют layout, кнопки и холст | Одинаковые состояния и меньше повторения UI |
| `ArtworkCard` | Показывает рисунок, песню, лайки и комментарии | Одна карточка работает в профиле и ленте |
| `SongControl`, `playSong` | Управляют одним общим player | Две карточки не запускают одновременно разные плееры |
| `watchConnection` | Отмечает состояние DB и запрещает новые offline writes | Локальное сохранение черновика остаётся доступным |
| Security Rules | Проверяют владельца и поля на сервере | Скрытая кнопка сама по себе не является защитой |
| `generate-audio.mjs` | Воссоздаёт включённые WAV | Самостоятельное решение без чужих записей |
| `serve-web.mjs` | Отдаёт локальный static export | Проверка browser-пакета без ещё одной runtime-зависимости |

## 7. Как самостоятельно включить Firebase

Наш код совместим с Firebase JS SDK 12+; Expo описывает этот путь для Auth/Realtime Database и Expo Go в [официальном руководстве](https://docs.expo.dev/guides/using-firebase/). Это настройка ученицы, не уже созданное облако.

1. В Firebase Console создайте или выберите собственный учебный проект и зарегистрируйте Web App. Скопируйте пять публичных значений конфигурации, включая точный databaseURL со страницы Realtime Database.
2. В Authentication включите Email/Password. Создайте Realtime Database с закрытыми правилами; не открывайте запись для всех.
3. В каталоге приложения выполните `cp .env.example .env`, переключите `EXPO_PUBLIC_BACKEND=firebase` и заполните все пять полей. Не добавляйте service-account JSON, приватные ключи или admin credentials. Expo public env встраивается в клиент; такие параметры не являются секретным серверным хранилищем.
4. Самостоятельно замените Database Rules точным содержимым `database.rules.json` через Console и опубликуйте их. Альтернативно после собственного CLI login примените именно database rules:

```bash
npx --yes firebase-tools@15 login
npx --yes firebase-tools@15 deploy --only database --project "ВАШ-PROJECT-ID"
```

5. Остановите Expo и перезапустите `npx expo start --go --lan --port 0 --clear`. Если проверяете static web export, выполните новый `npm run build`: env уже встроен в JS и старый bundle не поменяется от редактирования `.env`.
6. Создайте два учебных аккаунта и повторите сценарий из раздела ниже. Для настоящей общей ленты войдите с разных устройств в один Firebase-проект.

На web используется `browserLocalPersistence`. На Android/iOS Metro выбирает `persistence.native.ts` и использует `getReactNativePersistence(AsyncStorage)`, как в [Firebase API reference](https://firebase.google.com/docs/reference/js/auth#getreactnativepersistence). Общий `.d.ts` установленного Firebase не перечисляет этот RN export, поэтому native файл описывает его сигнатуру через namespace и проверяет наличие функции во время выполнения. TypeScript и native export проверены; окончательное подтверждение нативного сеанса требует запуска устройства.

В коде нет настройки внешних Firebase-ресурсов, тестовых администраторских паролей и автоматического deploy. Если Firebase сообщает `operation-not-allowed`, проверьте Email/Password; `permission_denied` — владелец/поля/применённые правила; `invalid-api-key` — config; ошибки сети — доступность сервисов. Приложение не выдаёт ошибку облака за успешную публикацию.

## 8. Почему Security Rules устроены так

Корень по умолчанию запрещает чтение и запись. `/artworks` читает только авторизованный участник: это общая учебная лента. Создание публикации разрешено, когда записи ещё нет и новый authorId совпадает с `auth.uid`. Готовая публикация неизменяема; удалить весь узел может только её автор. Лайки и комментарии имеют отдельные права на дочерних узлах.

Обязательны id, authorId, authorName, title, songId, pixels, createdAt. Неизвестные поля отвергаются. id должен совпадать с ключом; title/имя/комментарий имеют предел длины; songId принадлежит нашим трём песням; timestamp новой записи близок к серверному времени. На клиенте `trim()` отбрасывает все крайние пробельные символы; server regex дополнительно отвергает строки только из ASCII-пробелов. Поле pixels обязано содержать все ключи 0–255, каждый ключ ограничен этим диапазоном и каждый цвет принадлежит палитре. Поэтому дополнительные или пропущенные ячейки отвергаются.

`hasChildren` получает полный список 256 ключей намеренно: Rules API не предоставляет `numChildren()` как JS DataSnapshot. Ссылки на языковые методы и разграничение каскадных write/validate правил приведены в [Firebase Rules API](https://firebase.google.com/docs/reference/security/database) и [core syntax](https://firebase.google.com/docs/database/security/core-syntax).

Белый холст допустим как локальный Draft, но не как опубликованный Artwork. Клиент проверяет хотя бы один цветной пиксель, и сервер повторяет это условие через OR для всех 256 ячеек. Длинное выражение в rules намеренно перечисляет каждый возможный индекс; тест проверяет и полностью белый запрет, и разрешение цветного пикселя только в ячейке 255. Его можно воспроизвести через `Array.from({ length: 256 }, (_, i) => "newData.child('" + i + "').val() !== '#FFFFFF'").join(' || ')` и поместить в скобки после `hasChildren(...) &&`.

Новые правила не исправляют автоматически старые записи и административный импорт. Поэтому `decodeArtworks` дополнительно проверяет каждую полученную публикацию и её social fields в отдельном `try/catch`. Повреждённая запись не прерывает чтение соседних корректных. Callback передаёт одновременно корректные `items` и `warning`; `useArtworks` показывает их вместе. Если повреждены все записи, виден явный текст ошибки, а приглашение «Лента пока пустая» не отображается. Отсутствующая база (`null`) по-прежнему означает настоящую пустую ленту. Это проверяют отдельные regression-тесты с белой, повреждённой и корректной публикациями, а также объектом числовых ключей pixels.

Лайк записывает только соответствующий uid и только как `true`; снятие — удаление этого child. Комментарий создаётся только от собственного uid у существующей работы; удалить его может его автор. Начальное создание Artwork запрещает вкладывать заранее сфабрикованные likes/comments. Это существенный момент: разрешённая запись родителя иначе могла бы дать создателю полномочия записать чужие реакции.

Локальный Database Emulator проверяет те же правила:

```bash
java -version
npm run test:rules
```

Нужна Java 21+. Используются project `demo-soundshades` и loopback DB port из `firebase.json` (59103); никаких реальных Firebase-проектов для теста не требуется. Ожидаемые отрицательные проверки печатают `permission_denied` и всё равно заканчиваются PASS. Если порт занят, выберите другой свободный порт в `firebase.json`; тест читает конфигурацию оттуда. Не останавливайте неизвестный процесс только ради освобождения порта.

Правила не являются полной production-системой: в этом учебном объёме отсутствуют модерация, email verification, rate limiting и защита от массовой регистрации. Непустой цветной рисунок проверяется и приложением, и server rules; структура и разрешённые цвета также проверяются с обеих сторон. Production-готовность не заявлена.

## 9. Проверка своего приложения вручную

| Действие | Ожидаемый результат |
|---|---|
| Неправильный email/короткий пароль/пустое имя | Понятная ошибка, аккаунт не создаётся |
| Регистрация Алисы | Открывается лента, в профиле её имя и email |
| Вход с неверным паролем | Ошибка; чужой аккаунт не открывается |
| Выбор каждой песни, play/pause/replay | Звучит нужный WAV; виден статус; одновременно один player |
| Два цвета, белый ластик | Меняются именно выбранные ячейки |
| Публикация без названия или с белым холстом | Ошибка формы, публикации нет |
| Сохранение черновика и перезапуск | Возвращаются название, песня и пиксели |
| Отмена/подтверждение очистки | Отмена сохраняет рисунок; подтверждение удаляет рисунок и сохранённый draft |
| Публикация и профиль | Одна работа появляется в ленте и у собственного автора |
| Выход и Боб | Профиль и черновик Боба отделены, работа Алисы видна в общей ленте |
| Лайк/повторный лайк | Счётчик увеличивается/уменьшается один раз |
| Комментарий и удаление своего | Текст виден, собственный комментарий можно удалить |
| Чужая работа/чужой комментарий | Кнопка удаления отсутствует; emulator проверяет server denial |
| Удаление собственной работы | После подтверждения исчезает вместе с social data |
| Firebase offline | Новые cloud writes выключены; draft сохраняется локально; уже начатую отправку ждём до серверного подтверждения |
| Повреждённая запись рядом с корректной | `npm test` проверяет изоляцию: корректная работа сохраняется в списке, callback содержит предупреждение; all-bad не считается успешной пустой лентой |
| Узкий экран и клавиатура | Контент прокручивается, кнопки не уходят за горизонтальную границу |

Firebase SDK может локально отразить ожидающую запись в подписке. Окончательное сообщение об успехе и очистка draft наступают только после выполнения `set`/transaction. При разрыве связи посреди отправки оставьте приложение открытым и дождитесь восстановления; закрытие приложения до server ack не гарантирует сохранность незавершённой cloud-write. Для draft нажмите отдельную кнопку локального сохранения.

Текущие наблюдённые результаты записаны в VERIFICATION.md. Не заменяйте ручную проверку телефона успешным TypeScript или экспортом.

## 10. Разбор кода на защите и комплект сдачи

Покажите по порядку `App.tsx` (navigation и provider), `domain.ts` (модели и immutable редактор), `demo.ts` (local persistence), `backend.ts` (Firebase), `database.rules.json` (серверная защита), аудиогенератор и тесты. Объясните на конкретном примере переход Draft → Artwork и зачем автор определяется по сеансу. Статический export даёт bundle, а не запущенное приложение и не APK/IPA.

`docs/DEMO.md` содержит полный сценарий демонстрации и вопросы для подготовки. `docs/LEARNING_DIARY.md` — честный незаполненный шаблон: впишите свои реальные даты, затруднения, изменения, проверки, использованную помощь и выводы. Готовая реализация и наш протокол не являются личным дневником ученицы.

Черновик текста для отправки преподавателю: «Предлагаю SoundShades: приложение на Expo/TypeScript, где пользователь выбирает одну из трёх собственных коротких мелодий, рисует 16 × 16 пикселей, сохраняет черновик и публикует работу. Есть Auth, общая лента, профиль, лайки/комментарии и Firebase Rules. Подходит ли такой объём и источник музыки для final project?» Текст только подготовлен; отправка и утверждение не выполнены.

Перед сдачей разместите исходники и документацию в собственном онлайн Git-репозитории по правилам курса. Включите package-lock и WAV; исключите `node_modules`, `.expo`, `dist` и `.env`. `.gitignore` уже подготовлен. Не добавляйте административные ключи. Самостоятельный архив приложения не содержит `.git`, origin, историю или привязку к репозиторию. Зафиксируйте URL репозитория в личном дневнике, приложите требуемую документацию и покажите основной сценарий на телефоне.

## 11. Полный собственный код

Далее приведены все собственные текстовые файлы проекта целиком: приложение, модели, адаптеры, persistence, конфигурации, правила, тесты, скрипты и документы. Lock-файл и бинарные WAV не перепечатываются; lock поставляется в папке, WAV воспроизводятся включённым скриптом. Третьесторонние зависимости и сгенерированные build-файлы также не являются собственным исходным кодом.
````

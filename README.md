# Guide Manager Admin

Web-админка Guide Manager на React, TypeScript и Firebase. Production backend не используется: приложение работает через Firebase Auth, Firestore Web SDK и Firestore Security Rules.

## Требования

- Node.js 20+
- Firebase project `tourapp-66e02`
- включённый Email/Password provider в Firebase Authentication
- созданная Firestore Database

## Локальная настройка

```bash
npm install
cp .env.example .env.local
```

Заполните в `.env.local` публичные значения Firebase Web App из Firebase Console → Project settings → Your apps. Service account и private key в frontend env добавлять нельзя.

Запуск:

```bash
npm run dev
```

Проверка production-сборки:

```bash
npm run typecheck
npm run build
```

## Первый администратор

Script работает локально через Firebase Admin SDK и сохраняет существующие custom claims пользователя.

Вариант с Application Default Credentials:

```bash
export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/service-account.json
npm run admin:set -- admin@email.com
```

Script автоматически читает `FIREBASE_CREDENTIALS` из корневого `.env`, поэтому
при уже настроенном проекте достаточно выполнить:

```bash
npm run admin:set -- admin@email.com
```

Значение также можно передать непосредственно через окружение:

```bash
FIREBASE_CREDENTIALS=/absolute/path/service-account.json \
  npm run admin:set -- admin@email.com
```

После назначения claim пользователь должен войти заново, чтобы получить новый ID token.

## Firebase

В репозитории находятся:

- `firebase.json` — Firestore, Hosting и локальные emulator ports;
- `.firebaserc` — default project `tourapp-66e02`;
- `firestore.rules` — доступ админов и допущенных гидов;
- `firestore.indexes.json` — декларация индексов.

Перед deploy проверьте активный Firebase CLI account и project:

```bash
npx firebase-tools projects:list
npx firebase-tools use
```

Deploy rules и приложения:

```bash
npm run build
npx firebase-tools deploy --only firestore:rules,firestore:indexes,hosting
```

## Реализованные этапы

- Step 1: Firebase client config, Firestore rules, Hosting config, admin-claim script.
- Step 2: Email/password login, проверка `admin: true`, экран отказа в доступе и protected routes.
- Step 3: список, поиск, создание, просмотр, редактирование и удаление гидов.
- Step 4: список, создание, просмотр, редактирование и удаление компаний.
- Step 5: поиск гидов, добавление и удаление email в blacklist компании.
- Step 6: список, создание, просмотр, редактирование и удаление экскурсий с автоматическим `hasSpots`.

Модерация заявок относится к следующему этапу из `INSTRUCTIONS.md`.

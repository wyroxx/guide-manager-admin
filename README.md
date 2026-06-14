# Tour Guide Manager Admin

Веб приложение для админов Guide Manager. Flutter клиент - https://github.com/wyroxx/guide-manager

## Состав

- `frontend/` - React, TypeScript и Vite.
- `backend/` - FastAPI API с Firebase Firestore.
- `tests/` - тесты API.
- `start.py` - совместный запуск frontend и backend для разработки.

## Настройка

Требуются Node.js, npm и Python 3.

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements.txt
npm install
npm --prefix frontend install
```

Скачайте JSON-ключ service account в Firebase Console и задайте путь к нему:

```bash
cp .env.example .env
```

Затем отредактируйте `FIREBASE_CREDENTIALS` в `.env`.

## Запуск

```bash
source .venv/bin/activate
python3 start.py
```

Frontend будет доступен на `http://localhost:3000`, backend - на `http://localhost:8000`.

## Запуск в Docker

Укажите абсолютный путь к Firebase service account в `.env`:

```bash
cp .env.example .env
```

Запустите frontend и backend:

```bash
docker compose up --build
```

Frontend будет доступен на `http://localhost:3000`, backend - на `http://localhost:8000`. Firebase-ключ монтируется в контейнер только для чтения и не включается в образ.

## Проверка

```bash
python3 -m pytest
npm --prefix frontend run build
```

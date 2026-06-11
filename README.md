# TeamWave — фронтенд

Веб-клієнт інтерактивної платформи для віддалених тімбілдингових заходів: твори, пости, фандоми, підписки, улюблене, сповіщення та адмін-панель.

## Стек

- React 19 + Vite 6
- React Router 7
- Tailwind CSS 3
- Firebase Auth (Google)

## Локальна розробка

```bash
cd teamwave
cp .env.example .env
# заповніть Firebase-ключі та URL бекенду
yarn install
yarn dev
```

- Фронт: http://localhost:5173  
- Бекенд: http://localhost:3000

## Деплой на Vercel

### 1. Новий проєкт

| Параметр | Значення |
|----------|----------|
| Root Directory | `.` (корінь репо `teamwave`) |
| Framework | Vite (підхопиться з `vercel.json`) |
| Build Command | `npm run build` |
| Output Directory | `dist` |

Конфіг уже в **`vercel.json`**: SPA rewrite + `Cross-Origin-Opener-Policy` для Google popup.

### 2. Environment Variables (обовʼязково)

Усі змінні — для **Production**, **Preview**, **Development**:

| Змінна | Приклад |
|--------|---------|
| `VITE_API_BASE_URL` | `https://your-api.vercel.app/api` |
| `VITE_SERVER_BASE_URL` | `https://your-api.vercel.app` |
| `VITE_AUTH_BASE_URL` | `https://your-api.vercel.app/routes/auth` |
| `VITE_FIREBASE_API_KEY` | з Firebase Web app |
| `VITE_FIREBASE_AUTH_DOMAIN` | `teamwave-web.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `teamwave-web` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `teamwave-web.appspot.com` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | … |
| `VITE_FIREBASE_APP_ID` | `1:…:web:…` |
| `VITE_FIREBASE_ENABLE_ANALYTICS` | `false` |

Шаблон — у **`.env.example`**.

> Firebase Web config — **не** service account з бекенду!

### 3. Після деплою

1. Firebase Console → Authentication → Authorized domains → додай `your-app.vercel.app`
2. На **бекенді** встанови `FRONTEND_URL=https://your-app.vercel.app` → Redeploy API
3. Перевір вхід через Google і завантаження сторінок (`/works`, `/posts`)

Повна інструкція (бек + фронт): [DEPLOY.md](../DEPLOY.md)

## Змінні середовища

| Змінна | Опис |
|--------|------|
| `VITE_API_BASE_URL` | REST API (`/api`) |
| `VITE_SERVER_BASE_URL` | Базовий URL бекенду (медіа) |
| `VITE_AUTH_BASE_URL` | Синхронізація Firebase (`/routes/auth`) |
| `VITE_FIREBASE_*` | Web app Firebase (Google login) |

Проєкт Firebase на фронті та бекенді — **`teamwave-web`**.

## Збірка

```bash
yarn build    # на Vercel перевіряє наявність VITE_* через scripts/check-env.mjs
yarn preview  # перегляд production build локально
```

## Маршрути

| URL | Сторінка |
|-----|----------|
| `/` | Головна |
| `/fandoms` | Фандоми |
| `/works`, `/posts` | Каталоги |
| `/feed` | Стрічка підписок |
| `/cabinet` | Кабінет |
| `/login` | Вхід |

Демо-сценарій: [DEMO.md](../DEMO.md)

/**
 * Перевірка обовʼязкових VITE_* змінних під час збірки на Vercel/CI.
 * Локально (без VERCEL/CI) — пропускає, можна збирати з .env або дефолтами.
 */
const required = [
    'VITE_API_BASE_URL',
    'VITE_SERVER_BASE_URL',
    'VITE_AUTH_BASE_URL',
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID',
];

const isCi = Boolean(process.env.VERCEL || process.env.CI);

if (isCi) {
    const missing = required.filter((key) => !process.env[key]?.trim());

    if (missing.length > 0) {
        console.error('\n❌ Відсутні змінні середовища для production build:\n');
        missing.forEach((key) => console.error(`   - ${key}`));
        console.error('\nДодай їх у Vercel → Project → Settings → Environment Variables\n');
        process.exit(1);
    }

    console.log('✅ Усі обовʼязкові VITE_* змінні на місці');
}

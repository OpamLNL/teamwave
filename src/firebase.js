import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics, isSupported } from 'firebase/analytics';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const hasFirebaseConfig = Boolean(import.meta.env.VITE_FIREBASE_API_KEY?.trim());
const enableAnalytics = String(import.meta.env.VITE_FIREBASE_ENABLE_ANALYTICS || '').toLowerCase() === 'true';

let app = null;
let auth = null;
let googleProvider = null;

if (hasFirebaseConfig) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    googleProvider = new GoogleAuthProvider();

    // Analytics опційний. Вмикай тільки коли реально потрібно (і коли appId/measurementId валідні).
    if (enableAnalytics && import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
        isSupported().then((supported) => {
            if (!supported) return;
            try {
                getAnalytics(app);
            } catch (e) {
                // Не ламаємо додаток через аналітику (часто 404 при неправильному appId або коли app не існує в Firebase Console)
                console.warn('[TeamWave] Firebase Analytics недоступний:', e);
            }
        });
    }
} else {
    console.warn(
        '[TeamWave] Firebase не налаштовано. Додай ключі в teamwave/.env з Firebase Console → проєкт teamwave-web → Web app → firebaseConfig'
    );
}

export { auth, googleProvider, hasFirebaseConfig };

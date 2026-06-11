// utils/authFetch.js
import { auth } from "../firebase";

export async function authFetch(url, options = {}) {
    let token = localStorage.getItem('token');
    const headers = {
        ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
        ...options,
        headers
    });

    // Якщо токен недійсний — пробуємо оновити
    if (response.status === 401) {
        try {
            const user = auth?.currentUser;
            if (user) {
                const newToken = await user.getIdToken(true);
                localStorage.setItem('token', newToken);
                headers['Authorization'] = `Bearer ${newToken}`;
                return fetch(url, {
                    ...options,
                    headers
                });
            }
        } catch (err) {
            console.error("Помилка оновлення токена:", err);
        }
    }

    return response;
}

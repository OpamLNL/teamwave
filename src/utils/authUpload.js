import { auth } from '../firebase';

/** Завантаження файлів (multipart) з Firebase-токеном */
export async function authUpload(url, formData) {
    let token = localStorage.getItem('token');
    const headers = {};

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
    });

    if (response.status === 401) {
        try {
            const user = auth?.currentUser;
            if (user) {
                const newToken = await user.getIdToken(true);
                localStorage.setItem('token', newToken);
                headers.Authorization = `Bearer ${newToken}`;
                response = await fetch(url, {
                    method: 'POST',
                    headers,
                    body: formData,
                });
            }
        } catch (err) {
            console.error('Помилка оновлення токена:', err);
        }
    }

    return response;
}

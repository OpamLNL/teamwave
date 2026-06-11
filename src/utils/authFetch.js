import { auth } from '../firebase';

async function getAuthToken(forceRefresh = false) {
    const user = auth?.currentUser;
    if (!user) {
        return localStorage.getItem('token');
    }

    const token = await user.getIdToken(forceRefresh);
    localStorage.setItem('token', token);
    return token;
}

export async function authFetch(url, options = {}) {
    const headers = {
        ...(options.headers || {}),
    };

    if (!(options.body instanceof FormData) && !headers['Content-Type']) {
        headers['Content-Type'] = 'application/json';
    }

    let token = await getAuthToken(false);
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response = await fetch(url, {
        ...options,
        headers,
    });

    if (response.status === 401 && auth?.currentUser) {
        try {
            token = await getAuthToken(true);
            if (token) {
                headers.Authorization = `Bearer ${token}`;
                response = await fetch(url, {
                    ...options,
                    headers,
                });
            }
        } catch (err) {
            console.error('Помилка оновлення токена:', err);
        }
    }

    return response;
}

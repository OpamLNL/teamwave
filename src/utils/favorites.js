import { endpoints } from '../api/config';
import { authFetch } from './authFetch';

export async function fetchFavoriteItems() {
    const res = await authFetch(endpoints.favorites.meItems);
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Не вдалося завантажити улюблене');
    }
    return res.json();
}

export async function toggleFavorite(targetType, targetId) {
    const res = await authFetch(endpoints.favorites.toggle, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_type: targetType, target_id: targetId }),
    });
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || 'Помилка');
    }
    return res.json();
}

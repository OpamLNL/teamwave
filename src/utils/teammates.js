import { endpoints } from '../api/config';
import { apiGet } from '../api/client';
import { authFetch } from './authFetch';

async function parseResponse(res, fallbackMessage) {
    if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || fallbackMessage);
    }
    return res.json();
}

export async function fetchTeammates(userId) {
    const data = await apiGet(endpoints.teammates.byUser(userId));
    return Array.isArray(data) ? data : [];
}

export async function fetchConnectionStatus(userId) {
    const res = await authFetch(endpoints.teammates.status(userId));
    if (res.status === 401) return { status: 'guest' };
    return parseResponse(res, 'Не вдалося перевірити статус');
}

export async function fetchIncomingTeammateRequests() {
    const res = await authFetch(endpoints.teammates.incoming);
    return parseResponse(res, 'Не вдалося завантажити запрошення');
}

export async function sendTeammateInvite(userId) {
    const res = await authFetch(endpoints.teammates.invite(userId), { method: 'POST' });
    return parseResponse(res, 'Не вдалося надіслати запрошення');
}

export async function acceptTeammateInvite(userId) {
    const res = await authFetch(endpoints.teammates.accept(userId), { method: 'POST' });
    return parseResponse(res, 'Не вдалося прийняти запрошення');
}

export async function declineTeammateInvite(userId) {
    const res = await authFetch(endpoints.teammates.decline(userId), { method: 'POST' });
    return parseResponse(res, 'Не вдалося відхилити запрошення');
}

export async function cancelTeammateInvite(userId) {
    const res = await authFetch(endpoints.teammates.invite(userId), { method: 'DELETE' });
    return parseResponse(res, 'Не вдалося скасувати запрошення');
}

export async function removeTeammate(userId) {
    const res = await authFetch(endpoints.teammates.remove(userId), { method: 'DELETE' });
    return parseResponse(res, 'Не вдалося видалити з команди');
}

export async function updateMyProfile(payload) {
    const res = await authFetch(endpoints.users.me, {
        method: 'PUT',
        body: JSON.stringify(payload),
    });
    return parseResponse(res, 'Не вдалося оновити профіль');
}

export async function fetchUserTeams(userId) {
    const data = await apiGet(endpoints.users.teams(userId));
    return Array.isArray(data) ? data : [];
}

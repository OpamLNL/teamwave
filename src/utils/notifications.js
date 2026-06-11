import { endpoints } from '../api/config';
import { authFetch } from './authFetch';

export async function fetchNotifications() {
    const res = await authFetch(endpoints.notifications.me);
    if (!res.ok) throw new Error('Не вдалося завантажити сповіщення');
    const data = await res.json();
    return Array.isArray(data) ? data : [];
}

export async function fetchUnreadCount() {
    const res = await authFetch(endpoints.notifications.unreadCount);
    if (!res.ok) return 0;
    const data = await res.json();
    return Number(data.count ?? 0);
}

export async function markAllNotificationsRead() {
    const res = await authFetch(endpoints.notifications.readAll, { method: 'POST' });
    if (!res.ok) throw new Error('Не вдалося оновити сповіщення');
    return res.json();
}

export async function markNotificationRead(id) {
    const res = await authFetch(endpoints.notifications.read(id), { method: 'PATCH' });
    if (!res.ok) throw new Error('Не вдалося позначити прочитаним');
    return res.json();
}

const TYPE_LABELS = {
    event_invite: 'Запрошення',
    activity_started: 'Активність розпочата',
    activity_ended: 'Активність завершена',
    score_update: 'Оновлення балів',
    feedback_request: 'Відгук',
    system: 'Системне',
};

export function notificationTitle(n) {
    if (n.preview) return n.preview;
    const label = TYPE_LABELS[n.type] || 'Сповіщення';
    const actor = n.actor_name ? `${n.actor_name}: ` : '';
    return `${actor}${label}`;
}

export function notificationLink(n) {
    if (n.target_type === 'event' && n.target_id) {
        return `/events/${n.target_id}`;
    }
    if (n.target_type === 'activity' && n.target_id) {
        return '/events';
    }
    if (n.target_type === 'user' && n.target_id) {
        return `/users/${n.target_id}`;
    }
    return '/notifications';
}

export function notificationIcon(n) {
    if (n.type === 'event_invite') return '📨';
    if (n.type === 'activity_started') return '▶️';
    if (n.type === 'activity_ended') return '✅';
    if (n.type === 'score_update') return '🏆';
    if (n.type === 'feedback_request') return '💬';
    return '🔔';
}

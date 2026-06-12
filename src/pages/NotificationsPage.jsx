import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserAvatar from '../components/UserAvatar/UserAvatar';
import {
    fetchNotifications,
    markAllNotificationsRead,
    markNotificationRead,
    notificationIcon,
    notificationLink,
    notificationTitle,
} from '../utils/notifications';
import { formatDateTime } from '../utils/formatDate';

export default function NotificationsPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login', { replace: true, state: { from: '/notifications' } });
        }
    }, [user, authLoading, navigate]);

    const load = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError('');
        try {
            const data = await fetchNotifications();
            setItems(data);
        } catch (err) {
            setError(err.message || 'Не вдалося завантажити сповіщення');
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [user?.id]);

    useEffect(() => {
        if (!user?.id) return undefined;
        load();
    }, [user?.id, load]);

    const handleMarkAll = async () => {
        try {
            await markAllNotificationsRead();
            setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
        } catch (err) {
            setError(err.message);
        }
    };

    const handleOpen = async (n) => {
        if (!n.is_read) {
            try {
                await markNotificationRead(n.id);
                setItems((prev) =>
                    prev.map((item) => (item.id === n.id ? { ...item, is_read: true } : item))
                );
            } catch {
                // ignore
            }
        }
    };

    if (authLoading || !user) {
        return <p className="text-center text-muted py-16">Завантаження…</p>;
    }

    const unread = items.filter((n) => !n.is_read).length;

    return (
        <div className="max-w-2xl mx-auto">
            <header className="flex flex-wrap items-center justify-between gap-3 mb-8">
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight">Сповіщення</h1>
                    <p className="text-sm text-muted mt-1">
                        Лайки, коментарі та запрошення в команду
                        {unread > 0 ? ` · ${unread} непрочитаних` : ''}
                    </p>
                </div>
                {unread > 0 && (
                    <button
                        type="button"
                        onClick={handleMarkAll}
                        className="rounded-xl border border-border bg-bg px-4 py-2 text-sm font-semibold hover:bg-surface"
                    >
                        Позначити всі прочитаними
                    </button>
                )}
            </header>

            {loading ? (
                <p className="text-center text-muted py-16">Завантаження…</p>
            ) : error ? (
                <div className="text-center py-12 rounded-2xl border border-border">
                    <p className="text-muted mb-4">{error}</p>
                    <button
                        type="button"
                        onClick={load}
                        className="rounded-xl bg-primary text-white px-5 py-2 text-sm font-semibold hover:opacity-90"
                    >
                        Спробувати знову
                    </button>
                </div>
            ) : items.length === 0 ? (
                <div className="text-center py-16 rounded-2xl border border-dashed border-border">
                    <p className="text-4xl mb-3" aria-hidden="true">
                        🔔
                    </p>
                    <p className="text-muted">Сповіщень поки немає.</p>
                </div>
            ) : (
                <ul className="space-y-3">
                    {items.map((n) => (
                        <li key={n.id}>
                            <Link
                                to={notificationLink(n)}
                                onClick={() => handleOpen(n)}
                                className={`block rounded-2xl border px-4 py-4 transition hover:bg-surface ${
                                    n.is_read
                                        ? 'border-border bg-bg'
                                        : 'border-primary/30 bg-primary/5'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <UserAvatar
                                        src={n.actor_avatar}
                                        userId={n.actor_id}
                                        name={n.actor_name}
                                        className="w-10 h-10 rounded-full object-cover shrink-0"
                                    />
                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-start gap-2">
                                            <span className="text-lg shrink-0" aria-hidden="true">
                                                {notificationIcon(n)}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="text-sm font-semibold leading-snug">
                                                    {notificationTitle(n)}
                                                </p>
                                                {n.preview && (
                                                    <p className="text-sm text-muted mt-1 line-clamp-2">
                                                        «{n.preview}»
                                                    </p>
                                                )}
                                                {formatDateTime(n.created_at) && (
                                                    <time className="text-xs text-muted mt-2 block">
                                                        {formatDateTime(n.created_at)}
                                                    </time>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    {!n.is_read && (
                                        <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                                    )}
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

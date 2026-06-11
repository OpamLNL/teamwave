import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canCreateEvents } from '../utils/permissions';
import { fetchEvents, mapEventForCard } from '../utils/events';
import EventCard from '../components/events/EventCard';

export default function EventsPage() {
    const { user, role } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        const params = filter === 'all' ? {} : { status: filter };
        setLoading(true);
        fetchEvents(params)
            .then((data) => setEvents(Array.isArray(data) ? data.map(mapEventForCard) : []))
            .catch((err) => setError(err.message || 'Помилка завантаження'))
            .finally(() => setLoading(false));
    }, [filter]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">📅 Календар заходів</h2>
                    <p className="mt-1 text-sm text-muted">Минулі, поточні та майбутні тімбілдинги.</p>
                </div>
                {canCreateEvents(user, role) && (
                    <Link
                        to="/events/create"
                        className="inline-flex rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                        + Створити захід
                    </Link>
                )}
            </div>

            <div className="flex flex-wrap gap-2">
                {[
                    ['all', 'Усі'],
                    ['planned', 'Заплановані'],
                    ['active', 'Активні'],
                    ['finished', 'Завершені'],
                    ['draft', 'Чернетки'],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setFilter(id)}
                        className={[
                            'rounded-xl px-4 py-2 text-sm font-semibold transition',
                            filter === id ? 'bg-primary text-white' : 'border border-border bg-surface hover:bg-bg',
                        ].join(' ')}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {loading && <p className="text-muted">Завантаження…</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!loading && !error && (
                <div className="grid gap-4 lg:grid-cols-2">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            )}

            {!loading && !error && events.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-8 text-center text-muted">
                    Заходів у цій категорії поки немає.
                </div>
            )}

            <div className="rounded-2xl border border-dashed border-border bg-surface/50 p-6 text-center">
                <p className="text-sm text-muted">
                    Потрібен швидкий старт?{' '}
                    <Link to="/templates" className="font-semibold text-primary hover:opacity-80">Бібліотека шаблонів</Link>
                </p>
            </div>
        </div>
    );
}

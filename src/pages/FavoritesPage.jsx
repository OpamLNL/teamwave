import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchFavoriteItems } from '../utils/favorites';
import EventCard from '../components/events/EventCard';
import { mapEventForCard } from '../utils/events';

export default function FavoritesPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [events, setEvents] = useState([]);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const data = await fetchFavoriteItems();
            setEvents((data.events || []).map(mapEventForCard));
            setTemplates(data.templates || []);
        } catch (err) {
            setError(err.message || 'Помилка завантаження');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login', { state: { from: '/favorites' } });
            return;
        }
        load();
    }, [user, authLoading, navigate, load]);

    if (authLoading || !user) return null;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-2xl font-extrabold tracking-tight">Улюблене</h1>
                <p className="mt-1 text-sm text-muted">Збережені заходи та шаблони.</p>
            </div>

            {loading && <p className="text-muted">Завантаження…</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!loading && !error && events.length === 0 && templates.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border bg-surface/30 px-6 py-14 text-center">
                    <p className="text-lg font-bold mb-2">Улюбленого ще немає</p>
                    <p className="text-muted text-sm mb-6">Додай заходи в улюблене зі сторінки заходу.</p>
                    <Link to="/events" className="inline-flex rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white">Переглянути заходи</Link>
                </div>
            )}

            {events.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold mb-4">Заходи</h2>
                    <div className="grid gap-4 lg:grid-cols-2">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                </section>
            )}

            {templates.length > 0 && (
                <section>
                    <h2 className="text-lg font-bold mb-4">Шаблони</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {templates.map((t) => (
                            <div key={t.id} className="rounded-2xl border border-border bg-surface p-4">
                                <p className="font-bold">{t.name}</p>
                                <p className="mt-1 text-sm text-muted">{t.description}</p>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

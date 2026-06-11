import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchMyEvents, mapEventForCard } from '../utils/events';
import EventCard from '../components/events/EventCard';
import UserAvatar from '../components/UserAvatar/UserAvatar';

const ROLE_LABELS = {
    participant: 'Учасник',
    host: 'Ведучий',
    organizer: 'Організатор',
    admin: 'Адміністратор',
};

export default function UserCabinetPage() {
    const navigate = useNavigate();
    const { user, loading: authLoading } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;
        if (!user) {
            navigate('/login', { state: { from: '/cabinet' } });
            return;
        }
        fetchMyEvents()
            .then((data) => setEvents(Array.isArray(data) ? data.map(mapEventForCard) : []))
            .finally(() => setLoading(false));
    }, [user, authLoading, navigate]);

    if (authLoading || !user) return null;

    return (
        <div className="space-y-8">
            <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-4">
                    <UserAvatar src={user.avatar_url} name={user.name} className="h-16 w-16 rounded-2xl object-cover" />
                    <div>
                        <h1 className="text-2xl font-extrabold">{user.name}</h1>
                        <p className="text-sm text-muted">{user.email}</p>
                        <p className="mt-1 text-sm font-semibold text-primary">{ROLE_LABELS[user.role] || user.role}</p>
                    </div>
                </div>
                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-bg p-4 text-center">
                        <p className="text-xs text-muted">Бали</p>
                        <p className="text-2xl font-bold">{user.points ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-bg p-4 text-center">
                        <p className="text-xs text-muted">Рівень</p>
                        <p className="text-2xl font-bold">{user.level ?? 1}</p>
                    </div>
                    <div className="rounded-xl bg-bg p-4 text-center">
                        <p className="text-xs text-muted">Заходів</p>
                        <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                </div>
            </section>

            <section>
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-xl font-extrabold">Мої заходи</h2>
                    <Link to="/events" className="text-sm font-semibold text-primary">Усі заходи</Link>
                </div>
                {loading && <p className="text-muted">Завантаження…</p>}
                {!loading && events.length === 0 && (
                    <p className="text-muted text-sm">Ти ще не організатор, ведучий чи учасник жодного заходу.</p>
                )}
                <div className="grid gap-4 lg:grid-cols-2">
                    {events.map((event) => (
                        <EventCard key={event.id} event={event} />
                    ))}
                </div>
            </section>
        </div>
    );
}

import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { endpoints } from '../api/config';
import { apiGet } from '../api/client';
import { mapEventForCard } from '../utils/events';
import EventCard from '../components/events/EventCard';
import UserAvatar from '../components/UserAvatar/UserAvatar';

const ROLE_LABELS = {
    participant: 'Учасник',
    host: 'Ведучий',
    organizer: 'Організатор',
    admin: 'Адміністратор',
};

export default function UserProfilePage() {
    const { id } = useParams();
    const [profile, setProfile] = useState(null);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        Promise.all([
            apiGet(endpoints.users.byId(id)),
            apiGet(endpoints.users.events(id)),
        ])
            .then(([user, userEvents]) => {
                setProfile(user);
                setEvents(Array.isArray(userEvents) ? userEvents.map(mapEventForCard) : []);
            })
            .catch((err) => setError(err.message || 'Профіль не знайдено'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <p className="text-muted">Завантаження…</p>;
    if (error || !profile) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-red-500">{error || 'Користувача не знайдено'}</p>
                <Link to="/" className="mt-4 inline-block text-primary font-semibold">На головну</Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <div className="flex flex-wrap items-center gap-4">
                    <UserAvatar src={profile.avatar_url} name={profile.name} className="h-20 w-20 rounded-2xl object-cover" />
                    <div>
                        <h1 className="text-3xl font-extrabold">{profile.name}</h1>
                        <p className="text-muted">{profile.company || 'TeamWave'} · {ROLE_LABELS[profile.role] || profile.role}</p>
                        {profile.bio && <p className="mt-2 max-w-xl text-sm text-muted">{profile.bio}</p>}
                    </div>
                </div>
            </section>

            <section>
                <h2 className="text-xl font-extrabold mb-4">Заходи користувача</h2>
                {events.length === 0 ? (
                    <p className="text-muted text-sm">Заходів поки немає.</p>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

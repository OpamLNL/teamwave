import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { canCreateEvents } from '../utils/permissions';
import { fetchEvents, mapEventForCard } from '../utils/events';
import { resolveEventIcon } from '../utils/eventIcons';
import { activityTypes } from '../data/eventConstants';
import EventCard from '../components/events/EventCard';

export default function Home() {
    const { user, role } = useAuth();
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEvents()
            .then((data) => setEvents(Array.isArray(data) ? data.map(mapEventForCard) : []))
            .catch((err) => setError(err.message || 'Не вдалося завантажити заходи'))
            .finally(() => setLoading(false));
    }, []);

    const upcoming = events.filter((e) => ['planned', 'active'].includes(e.status));
    const nextEvent = upcoming[0];
    const plannedCount = events.filter((e) => e.status === 'planned').length;
    const finishedCount = events.filter((e) => e.status === 'finished').length;

    const canCreate = canCreateEvents(user, role);

    return (
        <div className="space-y-8">
            <section className="relative overflow-hidden rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-accent/15 blur-3xl" />

                <div className="relative grid gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:items-end">
                    <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                            Інтерактивний тімбілдинг
                        </p>
                        <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">
                            {user ? `Привіт, ${user.name.split(' ')[0]}!` : 'Ласкаво просимо до TeamWave'}
                        </h2>
                        <p className="mt-4 max-w-xl text-base text-muted">
                            Квізи, опитування, scavenger hunt і live-лідерборд — все в одній веб-платформі
                            для віддалених команд.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link to="/join" className="rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90">
                                Приєднатися за кодом
                            </Link>
                            <Link to="/events" className="rounded-2xl border border-border bg-bg px-5 py-3 text-sm font-semibold transition hover:bg-surface">
                                Переглянути заходи
                            </Link>
                            {canCreate && (
                                <Link to="/events/create" className="rounded-2xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-semibold text-primary transition hover:bg-primary/15">
                                    ＋ Створити захід
                                </Link>
                            )}
                        </div>
                    </div>

                    {nextEvent && (
                        <div className="rounded-2xl border border-border/80 bg-bg/80 p-5 backdrop-blur">
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">Наступний захід</p>
                            <p className="mt-2 flex items-center gap-2 text-lg font-bold">
                                <span className="text-2xl">{resolveEventIcon(nextEvent)}</span>
                                {nextEvent.title}
                            </p>
                            <p className="mt-1 text-sm text-muted">Код: <span className="font-mono font-bold text-text">{nextEvent.join_code}</span></p>
                            <Link to={`/events/${nextEvent.id}`} className="mt-4 inline-flex text-sm font-semibold text-primary hover:opacity-80">
                                Детальніше →
                            </Link>
                        </div>
                    )}
                </div>
            </section>

            <section className="grid gap-4 sm:grid-cols-3">
                {[
                    { label: 'Заплановано', value: String(plannedCount), hint: 'майбутніх заходів' },
                    { label: 'Завершено', value: String(finishedCount), hint: 'архів сесій' },
                    { label: 'Усього', value: String(events.length), hint: 'заходів у системі' },
                ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border bg-surface p-5">
                        <p className="text-sm text-muted">{item.label}</p>
                        <p className="mt-2 text-3xl font-extrabold tracking-tight">{item.value}</p>
                        <p className="mt-1 text-xs text-muted">{item.hint}</p>
                    </div>
                ))}
            </section>

            <section>
                <div className="mb-4 flex items-end justify-between gap-3">
                    <div>
                        <h3 className="text-xl font-extrabold tracking-tight">Найближчі заходи</h3>
                        <p className="text-sm text-muted">Дані з API TeamWave</p>
                    </div>
                    <Link to="/events" className="text-sm font-semibold text-primary hover:opacity-80">Усі заходи</Link>
                </div>
                {loading && <p className="text-muted">Завантаження…</p>}
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {!loading && !error && (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {upcoming.slice(0, 4).map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>

            <section>
                <h3 className="text-xl font-extrabold tracking-tight">Що вміє TeamWave</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {activityTypes.map((item) => (
                        <div key={item.title} className="rounded-2xl border border-border bg-surface p-5">
                            <div className="text-2xl">{item.icon}</div>
                            <h4 className="mt-3 font-bold">{item.title}</h4>
                            <p className="mt-2 text-sm text-muted">{item.text}</p>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}

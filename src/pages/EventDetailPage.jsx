import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchEventById } from '../utils/events';
import AuthorLink from '../components/AuthorLink/AuthorLink';
import StatusBadge from '../components/events/StatusBadge';

const PARTICIPANT_ROLE_LABELS = {
    participant: 'Учасник',
    host: 'Ведучий',
    organizer: 'Організатор',
};

function ParticipantRow({ participant }) {
    return (
        <li className="flex items-center justify-between gap-3 rounded-xl border border-border bg-bg px-4 py-3">
            <AuthorLink
                userId={participant.user_id}
                name={participant.user_name}
                avatarUrl={participant.user_avatar}
                avatarClassName="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
            />
            <div className="flex flex-wrap items-center justify-end gap-2 text-right">
                {participant.team_name && (
                    <span className="rounded-full bg-surface px-2.5 py-1 text-xs font-semibold text-muted">
                        {participant.team_name}
                    </span>
                )}
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                    {PARTICIPANT_ROLE_LABELS[participant.role_in_event] || participant.role_in_event}
                </span>
                {participant.score > 0 && (
                    <span className="text-xs font-semibold text-muted">{participant.score} б.</span>
                )}
            </div>
        </li>
    );
}

export default function EventDetailPage() {
    const { id } = useParams();
    const [event, setEvent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchEventById(id, 'all')
            .then(setEvent)
            .catch((err) => setError(err.message || 'Захід не знайдено'))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) {
        return <p className="text-muted">Завантаження…</p>;
    }

    if (error || !event) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <h2 className="text-xl font-bold">{error || 'Захід не знайдено'}</h2>
                <Link to="/events" className="mt-4 inline-block text-sm font-semibold text-primary">← До списку заходів</Link>
            </div>
        );
    }

    const participants = Array.isArray(event.participants) ? event.participants : [];

    return (
        <div className="space-y-6">
            <Link to="/events" className="inline-flex text-sm font-semibold text-primary hover:opacity-80">← Назад до заходів</Link>

            <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <StatusBadge status={event.status} />
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight">{event.title}</h2>
                        <p className="mt-3 max-w-2xl text-muted">{event.description}</p>
                    </div>
                    <div className="rounded-2xl bg-bg px-5 py-4 text-center">
                        <p className="text-xs uppercase tracking-wider text-muted">Код входу</p>
                        <p className="mt-1 font-mono text-2xl font-extrabold">{event.join_code}</p>
                    </div>
                </div>

                <div className="mt-6 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl bg-bg p-4">
                        <p className="text-xs text-muted">Початок</p>
                        <p className="mt-1 font-semibold">{new Date(event.start_time).toLocaleString('uk-UA')}</p>
                    </div>
                    <div className="rounded-xl bg-bg p-4">
                        <p className="text-xs text-muted">Тривалість</p>
                        <p className="mt-1 font-semibold">{event.duration_minutes} хв</p>
                    </div>
                    <div className="rounded-xl bg-bg p-4">
                        <p className="text-xs text-muted">Учасники</p>
                        <p className="mt-1 font-semibold">{event.participants_count ?? participants.length} / {event.max_participants}</p>
                    </div>
                </div>

                {(event.organizer_id || event.host_id) && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold">Команда заходу</h3>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            {event.organizer_id && (
                                <div className="rounded-xl border border-border bg-bg px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Організатор</p>
                                    <div className="mt-2">
                                        <AuthorLink
                                            userId={event.organizer_id}
                                            name={event.organizer_name}
                                            avatarUrl={event.organizer_avatar}
                                            avatarClassName="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                                        />
                                    </div>
                                </div>
                            )}
                            {event.host_id && (
                                <div className="rounded-xl border border-border bg-bg px-4 py-3">
                                    <p className="text-xs font-semibold uppercase tracking-wide text-muted">Ведучий</p>
                                    <div className="mt-2">
                                        <AuthorLink
                                            userId={event.host_id}
                                            name={event.host_name}
                                            avatarUrl={event.host_avatar}
                                            avatarClassName="h-10 w-10 rounded-xl object-cover border border-border shrink-0"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className="mt-8">
                    <h3 className="text-lg font-bold">
                        Учасники
                        <span className="ml-2 text-sm font-semibold text-muted">
                            ({participants.length})
                        </span>
                    </h3>
                    {participants.length === 0 ? (
                        <p className="mt-3 text-sm text-muted">Поки ніхто не приєднався до заходу.</p>
                    ) : (
                        <ul className="mt-4 space-y-3">
                            {participants.map((participant) => (
                                <ParticipantRow key={participant.id ?? `${participant.user_id}-${participant.event_id}`} participant={participant} />
                            ))}
                        </ul>
                    )}
                </div>

                {event.activities?.length > 0 && (
                    <div className="mt-8">
                        <h3 className="text-lg font-bold">Програма активностей</h3>
                        <ol className="mt-4 space-y-3">
                            {event.activities.map((activity, index) => (
                                <li key={activity.id} className="flex items-center gap-3 rounded-xl border border-border bg-bg px-4 py-3">
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-sm font-bold text-primary">
                                        {index + 1}
                                    </span>
                                    <div>
                                        <span className="font-medium">{activity.title}</span>
                                        <span className="ml-2 text-xs uppercase text-muted">{activity.type}</span>
                                    </div>
                                </li>
                            ))}
                        </ol>
                    </div>
                )}
            </section>
        </div>
    );
}

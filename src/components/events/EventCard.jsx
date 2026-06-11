import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import { resolveEventIcon } from '../../utils/eventIcons';
import { resolveMediaUrl } from '../../utils/mediaUrl';

function formatDate(value) {
    return new Date(value).toLocaleString('uk-UA', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function EventCard({ event }) {
    const icon = resolveEventIcon(event);
    const coverUrl = resolveMediaUrl(event.cover_url);

    return (
        <Link
            to={`/events/${event.id}`}
            className="group block overflow-hidden rounded-2xl border border-border bg-surface transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
        >
            {coverUrl ? (
                <div className="relative h-36 overflow-hidden">
                    <img src={coverUrl} alt="" className="h-full w-full object-cover transition group-hover:scale-[1.02]" />
                    <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-surface/90 text-2xl shadow backdrop-blur">
                        {icon}
                    </span>
                </div>
            ) : (
                <div className="relative flex h-28 items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10">
                    <span className="text-4xl">{icon}</span>
                </div>
            )}

            <div className="p-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <StatusBadge status={event.status} />
                        <h3 className="mt-3 text-lg font-extrabold tracking-tight group-hover:text-primary transition-colors">
                            {event.title}
                        </h3>
                    </div>
                    <span className="rounded-xl bg-bg px-3 py-1.5 text-xs font-bold tracking-wider text-muted">
                        {event.join_code}
                    </span>
                </div>

                <p className="mt-2 line-clamp-2 text-sm text-muted">{event.description}</p>

                <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted">
                    <span>📅 {formatDate(event.start_time)}</span>
                    <span>⏱ {event.duration_minutes} хв</span>
                    <span>👥 {event.participants}/{event.max_participants}</span>
                </div>
            </div>
        </Link>
    );
}

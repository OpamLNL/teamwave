import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchTemplateById, fetchTemplates } from '../utils/events';
import { resolveEventIcon } from '../utils/eventIcons';
import { resolveMediaUrl } from '../utils/mediaUrl';
import TypingRacePreview from '../components/typing/TypingRacePreview';
import { isTeamRelaySettings, isTypingRaceActivity } from '../utils/typingRace';

const TYPING_TEMPLATE_IDS = new Set([9, 16, 17]);

const categoryColors = {
    icebreaker: 'from-cyan-500/20 to-blue-500/10',
    quiz: 'from-violet-500/20 to-purple-500/10',
    challenge: 'from-orange-500/20 to-amber-500/10',
    combined: 'from-primary/20 to-accent/10',
    wellness: 'from-emerald-500/20 to-teal-500/10',
    game: 'from-pink-500/20 to-rose-500/10',
    hybrid: 'from-indigo-500/20 to-blue-500/10',
    collaborative: 'from-blue-500/20 to-cyan-500/10',
    creative: 'from-fuchsia-500/20 to-pink-500/10',
    themed: 'from-amber-500/20 to-orange-500/10',
};

function TemplateCard({ template }) {
    const { user, role } = useAuth();
    const [expanded, setExpanded] = useState(false);
    const [details, setDetails] = useState(null);
    const [loadingDetails, setLoadingDetails] = useState(false);
    const isTypingTemplate = TYPING_TEMPLATE_IDS.has(template.id);
    const icon = resolveEventIcon(template);
    const coverUrl = resolveMediaUrl(template.cover_url);
    const canCreate = user && ['admin', 'organizer', 'host'].includes(role);

    const loadDetails = async () => {
        if (details || loadingDetails) return;
        setLoadingDetails(true);
        try {
            const data = await fetchTemplateById(template.id);
            setDetails(data);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleToggle = async () => {
        const next = !expanded;
        setExpanded(next);
        if (next && isTypingTemplate) {
            await loadDetails();
        }
    };

    const typingActivity = details?.activities?.find(isTypingRaceActivity);

    return (
        <article className="overflow-hidden rounded-2xl border border-border bg-surface">
            {coverUrl ? (
                <div className="relative h-32">
                    <img src={coverUrl} alt="" className="h-full w-full object-cover" />
                    <span className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-xl bg-surface/90 text-xl shadow backdrop-blur">
                        {icon}
                    </span>
                </div>
            ) : (
                <div className={`relative bg-gradient-to-br ${categoryColors[template.category] || categoryColors.combined} px-5 py-5`}>
                    <span className="text-4xl">{icon}</span>
                </div>
            )}

            <div className="p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">{template.category}</p>
                <h3 className="mt-2 text-xl font-extrabold tracking-tight">{template.name}</h3>
                {isTypingTemplate && (
                    <span className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                        ⌨ Typing race
                    </span>
                )}

                <p className="mt-3 text-sm text-muted">{template.description}</p>
                <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-muted">
                    <span className="rounded-full bg-bg px-3 py-1">Тип: {template.event_type}</span>
                    <span className="rounded-full bg-bg px-3 py-1">
                        {icon} {template.activities_count} активност{template.activities_count === 1 ? 'ь' : 'і'}
                    </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                    {isTypingTemplate && (
                        <button
                            type="button"
                            onClick={handleToggle}
                            className="text-sm font-semibold text-primary hover:opacity-80"
                        >
                            {expanded ? 'Сховати формат' : 'Переглянути формат'}
                        </button>
                    )}
                    {canCreate && (
                        <Link
                            to={`/events/create?template=${template.id}`}
                            className="text-sm font-semibold text-accent hover:opacity-80"
                        >
                            Створити захід →
                        </Link>
                    )}
                </div>

                {expanded && isTypingTemplate && (
                    <div className="mt-4 border-t border-border pt-4">
                        {loadingDetails && <p className="text-sm text-muted">Завантаження…</p>}
                        {typingActivity?.settings && isTeamRelaySettings(typingActivity.settings) && (
                            <TypingRacePreview settings={typingActivity.settings} compact />
                        )}
                        {typingActivity?.settings && typingActivity.settings.mode === 'individual' && (
                            <TypingRacePreview settings={typingActivity.settings} compact />
                        )}
                    </div>
                )}
            </div>
        </article>
    );
}

export default function TemplatesPage() {
    const { user, role } = useAuth();
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTemplates()
            .then((data) => setTemplates(Array.isArray(data) ? data : []))
            .catch((err) => setError(err.message || 'Помилка завантаження'))
            .finally(() => setLoading(false));
    }, []);

    const typingTemplates = templates.filter((t) => TYPING_TEMPLATE_IDS.has(t.id));
    const otherTemplates = templates.filter((t) => !TYPING_TEMPLATE_IDS.has(t.id));

    return (
        <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-extrabold tracking-tight">📚 Бібліотека шаблонів</h2>
                    <p className="mt-1 text-sm text-muted">Готові сценарії — оберіть шаблон і створіть захід одним кліком.</p>
                </div>
                {user && ['admin', 'organizer', 'host'].includes(role) && (
                    <Link
                        to="/events/create"
                        className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:opacity-90"
                    >
                        + Новий захід
                    </Link>
                )}
            </div>

            {loading && <p className="text-muted">Завантаження…</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            {!loading && !error && typingTemplates.length > 0 && (
                <section className="space-y-4">
                    <div>
                        <h3 className="text-lg font-bold">⌨ Typing race</h3>
                        <p className="text-sm text-muted">Командний relay: кожен гравець друкує слова свого кольору.</p>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {typingTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </section>
            )}

            {!loading && !error && otherTemplates.length > 0 && (
                <section className="space-y-4">
                    <h3 className="text-lg font-bold">Інші шаблони</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                        {otherTemplates.map((template) => (
                            <TemplateCard key={template.id} template={template} />
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}

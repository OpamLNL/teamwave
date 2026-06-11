import { useEffect, useState } from 'react';
import { fetchTemplates } from '../utils/events';

const categoryColors = {
    icebreaker: 'from-cyan-500/20 to-blue-500/10',
    quiz: 'from-violet-500/20 to-purple-500/10',
    challenge: 'from-orange-500/20 to-amber-500/10',
    combined: 'from-primary/20 to-accent/10',
    wellness: 'from-emerald-500/20 to-teal-500/10',
    game: 'from-pink-500/20 to-rose-500/10',
    hybrid: 'from-indigo-500/20 to-blue-500/10',
};

export default function TemplatesPage() {
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchTemplates()
            .then((data) => setTemplates(Array.isArray(data) ? data : []))
            .catch((err) => setError(err.message || 'Помилка завантаження'))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-extrabold tracking-tight">Бібліотека шаблонів</h2>
                <p className="mt-1 text-sm text-muted">Готові сценарії з бази даних TeamWave.</p>
            </div>

            {loading && <p className="text-muted">Завантаження…</p>}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="grid gap-4 md:grid-cols-2">
                {templates.map((template) => (
                    <article key={template.id} className="overflow-hidden rounded-2xl border border-border bg-surface">
                        <div className={`bg-gradient-to-br ${categoryColors[template.category] || categoryColors.combined} px-5 py-4`}>
                            <p className="text-xs font-semibold uppercase tracking-wider text-muted">{template.category}</p>
                            <h3 className="mt-2 text-xl font-extrabold tracking-tight">{template.name}</h3>
                        </div>
                        <div className="p-5">
                            <p className="text-sm text-muted">{template.description}</p>
                            <div className="mt-4 flex flex-wrap gap-3 text-xs font-semibold text-muted">
                                <span className="rounded-full bg-bg px-3 py-1">Тип: {template.event_type}</span>
                                <span className="rounded-full bg-bg px-3 py-1">
                                    🎯 {template.activities_count} активност{template.activities_count === 1 ? 'ь' : 'і'}
                                </span>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </div>
    );
}

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    createEvent,
    createEventFromTemplate,
    fetchTemplateById,
    fetchTemplates,
    uploadEventCover,
} from '../utils/events';
import { ICON_OPTIONS, resolveEventIcon, shouldOpenLobby } from '../utils/eventIcons';
import { resolveMediaUrl } from '../utils/mediaUrl';

const EVENT_TYPES = [
    { value: 'combined', label: 'Комбінований' },
    { value: 'icebreaker', label: 'Icebreaker' },
    { value: 'quiz', label: 'Quiz' },
    { value: 'game', label: 'Гра' },
    { value: 'challenge', label: 'Challenge' },
    { value: 'collaborative', label: 'Колaborative' },
    { value: 'creative', label: 'Creative' },
    { value: 'wellness', label: 'Wellness' },
    { value: 'hybrid', label: 'Hybrid' },
    { value: 'themed', label: 'Themed' },
];

export default function CreateEventPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, role } = useAuth();
    const fileInputRef = useRef(null);

    const initialTemplateId = searchParams.get('template');
    const [mode, setMode] = useState(initialTemplateId ? 'template' : 'blank');
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(
        initialTemplateId ? Number(initialTemplateId) : ''
    );
    const [templatePreview, setTemplatePreview] = useState(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [eventType, setEventType] = useState('combined');
    const [icon, setIcon] = useState('📅');
    const [startTime, setStartTime] = useState(() => {
        const d = new Date(Date.now() + 3600000);
        d.setMinutes(0, 0, 0);
        return d.toISOString().slice(0, 16);
    });
    const [duration, setDuration] = useState(60);
    const [coverFile, setCoverFile] = useState(null);
    const [coverPreview, setCoverPreview] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canCreate = user && ['admin', 'organizer', 'host'].includes(role);

    useEffect(() => {
        fetchTemplates()
            .then((data) => setTemplates(Array.isArray(data) ? data : []))
            .catch(() => setTemplates([]));
    }, []);

    useEffect(() => {
        if (mode !== 'template' || !selectedTemplate) {
            setTemplatePreview(null);
            return;
        }
        fetchTemplateById(selectedTemplate)
            .then((data) => {
                setTemplatePreview(data);
                setIcon(resolveEventIcon(data));
                if (!title.trim()) setTitle(data.name || '');
                if (!description.trim()) setDescription(data.description || '');
            })
            .catch(() => setTemplatePreview(null));
    }, [mode, selectedTemplate]);

    useEffect(() => {
        return () => {
            if (coverPreview.startsWith('blob:')) URL.revokeObjectURL(coverPreview);
        };
    }, [coverPreview]);

    const selectedTemplateMeta = useMemo(
        () => templates.find((t) => Number(t.id) === Number(selectedTemplate)),
        [templates, selectedTemplate]
    );

    const handleCoverChange = (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        setCoverFile(file);
        setCoverPreview(URL.createObjectURL(file));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                title: title.trim() || undefined,
                description: description.trim() || undefined,
                start_time: startTime.replace('T', ' '),
                duration_minutes: Number(duration) || 60,
                status: 'planned',
                is_public: true,
                icon,
            };

            let created;
            if (mode === 'template') {
                if (!selectedTemplate) throw new Error('Оберіть шаблон');
                created = await createEventFromTemplate(selectedTemplate, payload);
            } else {
                created = await createEvent({
                    ...payload,
                    title: title.trim() || 'Новий захід',
                    type: eventType,
                });
            }

            const openLobby = shouldOpenLobby(created);

            if (coverFile) {
                const withCover = await uploadEventCover(created.id, coverFile);
                created = { ...created, ...withCover };
            }

            if (openLobby) {
                navigate(`/events/${created.id}/lobby`);
            } else {
                navigate(`/events/${created.id}`);
            }
        } catch (err) {
            setError(err.message || 'Не вдалося створити захід');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
                <h2 className="text-xl font-bold">Створення заходу</h2>
                <p className="mt-3 text-sm text-muted">Увійди як організатор або ведучий.</p>
                <Link to="/login" className="mt-4 inline-block text-sm font-semibold text-primary">Увійти</Link>
            </div>
        );
    }

    if (!canCreate) {
        return (
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
                <h2 className="text-xl font-bold">Недостатньо прав</h2>
                <p className="mt-3 text-sm text-muted">Створювати заходи можуть лише організатори та ведучі.</p>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-2xl space-y-6">
            <div>
                <Link to="/events" className="text-sm font-semibold text-primary hover:opacity-80">← До заходів</Link>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Новий захід</h2>
                <p className="mt-1 text-sm text-muted">Створіть з нуля або на базі готового шаблону.</p>
            </div>

            <div className="flex gap-2 rounded-2xl border border-border bg-surface p-1">
                {[
                    ['blank', 'З нуля'],
                    ['template', 'З шаблону'],
                ].map(([id, label]) => (
                    <button
                        key={id}
                        type="button"
                        onClick={() => setMode(id)}
                        className={[
                            'flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold transition',
                            mode === id ? 'bg-primary text-white' : 'text-muted hover:bg-bg',
                        ].join(' ')}
                    >
                        {label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                {mode === 'template' && (
                    <div>
                        <label className="block text-sm font-semibold">Шаблон</label>
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(Number(e.target.value))}
                            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                            required
                        >
                            <option value="" disabled>Оберіть шаблон</option>
                            {templates.map((template) => (
                                <option key={template.id} value={template.id}>
                                    {resolveEventIcon(template)} {template.name}
                                </option>
                            ))}
                        </select>
                        {selectedTemplateMeta && (
                            <p className="mt-2 text-sm text-muted">{selectedTemplateMeta.description}</p>
                        )}
                        {templatePreview?.activities?.length > 0 && (
                            <p className="mt-1 text-xs text-muted">
                                {templatePreview.activities.length} активност(і/ей) буде скопійовано
                            </p>
                        )}
                    </div>
                )}

                {mode === 'blank' && (
                    <div>
                        <label className="block text-sm font-semibold">Тип заходу</label>
                        <select
                            value={eventType}
                            onChange={(e) => {
                                setEventType(e.target.value);
                                setIcon(resolveEventIcon({ type: e.target.value, category: e.target.value }));
                            }}
                            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                        >
                            {EVENT_TYPES.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-sm font-semibold">Іконка</label>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {ICON_OPTIONS.map((emoji) => (
                            <button
                                key={emoji}
                                type="button"
                                onClick={() => setIcon(emoji)}
                                className={[
                                    'flex h-11 w-11 items-center justify-center rounded-xl border text-xl transition',
                                    icon === emoji
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border bg-bg hover:border-primary/40',
                                ].join(' ')}
                            >
                                {emoji}
                            </button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold">Обкладинка</label>
                    <div className="mt-2 flex flex-wrap items-center gap-4">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="rounded-2xl border border-dashed border-border bg-bg px-4 py-3 text-sm font-semibold text-primary hover:border-primary/40"
                        >
                            {coverFile ? 'Змінити зображення' : 'Завантажити зображення'}
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleCoverChange}
                        />
                        {(coverPreview || templatePreview?.cover_url) && (
                            <img
                                src={coverPreview || resolveMediaUrl(templatePreview?.cover_url)}
                                alt=""
                                className="h-20 w-32 rounded-xl object-cover border border-border"
                            />
                        )}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold">Назва</label>
                    <div className="relative mt-2">
                        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-xl">{icon}</span>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Team Quiz Night"
                            className="w-full rounded-2xl border border-border bg-bg py-3 pl-12 pr-4 outline-none focus:border-primary"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-semibold">Опис</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                    />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                        <label className="block text-sm font-semibold">Час початку</label>
                        <input
                            type="datetime-local"
                            value={startTime}
                            onChange={(e) => setStartTime(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold">Тривалість (хв)</label>
                        <input
                            type="number"
                            min={15}
                            max={480}
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                        />
                    </div>
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={loading || (mode === 'template' && !selectedTemplate)}
                    className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? 'Створення…' : mode === 'template' ? 'Створити з шаблону' : 'Створити захід'}
                </button>
            </form>
        </div>
    );
}

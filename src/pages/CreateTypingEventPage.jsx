import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { createEventFromTemplate } from '../utils/events';

const TEMPLATE_OPTIONS = [
    { id: 16, label: 'Командний Typing Relay (4 гравці)' },
    { id: 17, label: 'Typing Cup (3×3)' },
];

export default function CreateTypingEventPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { user, role } = useAuth();
    const initialTemplate = Number(searchParams.get('template')) || 16;

    const [templateId, setTemplateId] = useState(
        TEMPLATE_OPTIONS.some((t) => t.id === initialTemplate) ? initialTemplate : 16
    );
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState(() => {
        const d = new Date(Date.now() + 3600000);
        d.setMinutes(0, 0, 0);
        return d.toISOString().slice(0, 16);
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const canCreate = user && ['admin', 'organizer', 'host'].includes(role);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const created = await createEventFromTemplate(templateId, {
                title: title.trim() || undefined,
                description: description.trim() || undefined,
                start_time: startTime.replace('T', ' '),
                status: 'planned',
                is_public: true,
            });
            navigate(`/events/${created.id}/lobby`);
        } catch (err) {
            setError(err.message || 'Не вдалося створити захід');
        } finally {
            setLoading(false);
        }
    };

    if (!user) {
        return (
            <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface p-8 text-center">
                <h2 className="text-xl font-bold">Створення typing race</h2>
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
                <Link to="/templates" className="text-sm font-semibold text-primary hover:opacity-80">← До шаблонів</Link>
                <h2 className="mt-3 text-2xl font-extrabold tracking-tight">Новий typing race</h2>
                <p className="mt-1 text-sm text-muted">Захід створюється з шаблону — далі реєстрація команд у лобі.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <div>
                    <label className="block text-sm font-semibold">Шаблон</label>
                    <select
                        value={templateId}
                        onChange={(e) => setTemplateId(Number(e.target.value))}
                        className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                    >
                        {TEMPLATE_OPTIONS.map((opt) => (
                            <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-sm font-semibold">Назва заходу</label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Typing Cup — пʼятниця"
                        className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                    />
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

                <div>
                    <label className="block text-sm font-semibold">Час початку</label>
                    <input
                        type="datetime-local"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 outline-none focus:border-primary"
                    />
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? 'Створення…' : 'Створити і перейти до лобі'}
                </button>
            </form>
        </div>
    );
}

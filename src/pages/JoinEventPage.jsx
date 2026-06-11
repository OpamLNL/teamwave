import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../api/config';
import { authFetch } from '../utils/authFetch';
import { fetchEventByCode } from '../utils/events';

export default function JoinEventPage() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const normalized = code.trim().toUpperCase();
            const match = await fetchEventByCode(normalized);

            if (user) {
                await authFetch(endpoints.events.joinByCode, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ join_code: normalized }),
                });
            }

            navigate(`/events/${match.id}`);
        } catch (err) {
            setError(err.message || 'Захід з таким кодом не знайдено');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="mx-auto max-w-xl space-y-6">
            <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-primary/15 text-3xl">➜</div>
                <h2 className="mt-4 text-2xl font-extrabold tracking-tight">Приєднатися до заходу</h2>
                <p className="mt-2 text-sm text-muted">Введи код від організатора.</p>
            </div>

            <form onSubmit={handleSubmit} className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <label htmlFor="join-code" className="block text-sm font-semibold">Код заходу</label>
                <input
                    id="join-code"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="NOVA26"
                    className="mt-2 w-full rounded-2xl border border-border bg-bg px-4 py-3 font-mono text-lg tracking-[0.2em] outline-none transition focus:border-primary"
                />
                {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="mt-6 w-full rounded-2xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
                >
                    {loading ? 'Перевірка…' : 'Увійти в захід'}
                </button>
                {!user && (
                    <p className="mt-4 text-center text-xs text-muted">
                        Без входу ти побачиш лише деталі. <Link to="/login" className="text-primary font-semibold">Увійди</Link>, щоб приєднатися.
                    </p>
                )}
            </form>

            <p className="text-center text-sm text-muted">
                Організатор? <Link to="/events" className="font-semibold text-primary hover:opacity-80">Переглянь заходи</Link>
            </p>
        </div>
    );
}

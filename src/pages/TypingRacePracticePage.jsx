import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    fetchEventById,
    fetchPracticeState,
    resetPracticeRun,
    sendPracticeChar,
    startPracticeRun,
} from '../utils/events';
import { formatRaceTime, resolveTypingRaceActivity } from '../utils/typingRace';
import TypingRaceLive from '../components/typing/TypingRaceLive';
import StatusBadge from '../components/events/StatusBadge';

export default function TypingRacePracticePage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();

    const [event, setEvent] = useState(null);
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [typeError, setTypeError] = useState('');

    const typingActivity = useMemo(
        () => resolveTypingRaceActivity(event?.activities),
        [event]
    );

    useEffect(() => {
        if (authLoading) return;
        setLoading(true);
        fetchEventById(id, 'activities')
            .then(async (data) => {
                setEvent(data);
                const activity = resolveTypingRaceActivity(data?.activities);
                if (!activity) throw new Error('Typing race не знайдено');
                if (!user) return;
                const initial = await fetchPracticeState(id, activity.id);
                setState(initial);
            })
            .catch((err) => setError(err.message || 'Помилка'))
            .finally(() => setLoading(false));
    }, [id, user, authLoading]);

    const handleStart = async () => {
        if (!typingActivity) return;
        setBusy('start');
        setError('');
        try {
            const next = await startPracticeRun(id, typingActivity.id);
            setState(next);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleReset = async () => {
        if (!typingActivity) return;
        setBusy('reset');
        setError('');
        try {
            const next = await resetPracticeRun(id, typingActivity.id);
            setState(next);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleType = async (char) => {
        if (!typingActivity) return;
        setTypeError('');
        try {
            const next = await sendPracticeChar(id, typingActivity.id, char);
            setState(next);
        } catch (err) {
            setTypeError(err.message);
            throw err;
        }
    };

    if (loading || authLoading) return <p className="text-muted">Завантаження…</p>;

    if (error && !event) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-red-500">{error}</p>
                <Link to={`/events/${id}`} className="mt-4 inline-block text-sm font-semibold text-primary">← До заходу</Link>
            </div>
        );
    }

    const practiceFinished = Boolean(state?.practice_run?.is_finished);
    const practiceActive = Boolean(state?.is_practice_active);

    return (
        <div className="space-y-6">
            <Link to={`/events/${id}`} className="text-sm font-semibold text-primary hover:opacity-80">← До заходу</Link>

            <section className="rounded-[1.75rem] border border-accent/20 bg-surface p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                        <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-bold uppercase tracking-wide text-accent">
                            Тренування
                        </span>
                        <h2 className="mt-3 text-2xl font-extrabold">{event?.title}</h2>
                        <p className="mt-1 text-sm text-muted">
                            Пробний прогін без впливу на офіційний результат · {typingActivity?.title}
                        </p>
                    </div>
                    <StatusBadge status={event?.status} />
                </div>

                {!user && (
                    <p className="mt-4 rounded-xl bg-bg px-4 py-3 text-sm text-muted">
                        <Link to="/login" className="font-semibold text-primary">Увійдіть</Link> і вступіть у команду на сторінці заходу.
                    </p>
                )}

                {user && !state?.my_team_id && (
                    <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        Спочатку вступіть у команду на{' '}
                        <Link to={`/events/${id}`} className="font-semibold text-primary">сторінці заходу</Link>.
                    </p>
                )}

                {user && state?.my_team_id && (
                    <div className="mt-6 flex flex-wrap gap-2">
                        {!practiceActive && !practiceFinished && (
                            <button
                                type="button"
                                onClick={handleStart}
                                disabled={busy === 'start' || event?.status === 'active'}
                                className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                            >
                                {busy === 'start' ? 'Запуск…' : 'Почати тренування'}
                            </button>
                        )}
                        {(practiceActive || practiceFinished) && (
                            <button
                                type="button"
                                onClick={handleReset}
                                disabled={busy === 'reset'}
                                className="rounded-xl border border-border bg-bg px-4 py-2 text-sm font-semibold hover:bg-surface disabled:opacity-50"
                            >
                                {busy === 'reset' ? '…' : 'Спробувати знову'}
                            </button>
                        )}
                    </div>
                )}

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                {practiceFinished && state?.practice_run?.completion_time_ms != null && (
                    <p className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
                        Тренувальний час: {formatRaceTime(state.practice_run.completion_time_ms)}
                    </p>
                )}

                {practiceActive && state?.settings && (
                    <div className="mt-6">
                        <p className="mb-3 text-sm text-muted">
                            У тренуванні ви проходите весь текст самостійно. Кольори показують, за якого гравця друкує кожен фрагмент; ваш слот позначено «· ви».
                        </p>
                        <TypingRaceLive
                            settings={state.settings}
                            run={state.practice_run}
                            canType={state.can_type}
                            onType={handleType}
                            error={typeError}
                            mySlot={state.my_slot}
                            practiceMode
                        />
                    </div>
                )}
            </section>
        </div>
    );
}

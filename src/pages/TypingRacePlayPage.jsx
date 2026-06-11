import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    fetchEventById,
    fetchTypingState,
    finishTypingRace,
    sendTypedChar,
} from '../utils/events';
import { canManageEvent } from '../utils/permissions';
import { isTypingRaceActivity } from '../utils/typingRace';
import TypingRaceLive from '../components/typing/TypingRaceLive';
import TeamLeaderboard from '../components/typing/TeamLeaderboard';
import StatusBadge from '../components/events/StatusBadge';

export default function TypingRacePlayPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, role } = useAuth();

    const [event, setEvent] = useState(null);
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [typeError, setTypeError] = useState('');

    const typingActivity = useMemo(
        () => event?.activities?.find(isTypingRaceActivity),
        [event]
    );

    const myRun = useMemo(() => {
        if (!state?.my_team_id) return null;
        return state.runs?.find((r) => Number(r.event_team_id) === Number(state.my_team_id));
    }, [state]);

    const leaderboard = useMemo(() => {
        const finished = (state?.teams || [])
            .filter((t) => t.completion_time_ms != null)
            .sort((a, b) => a.completion_time_ms - b.completion_time_ms);
        return finished.map((t, index) => ({
            team_id: t.id,
            team_name: t.name,
            completion_time_ms: t.completion_time_ms,
            rank_position: index + 1,
        }));
    }, [state]);

    const refresh = useCallback(async () => {
        if (!typingActivity) return;
        const next = await fetchTypingState(id, typingActivity.id);
        setState(next);
        if (next.event?.status === 'finished') {
            setEvent((prev) => (prev ? { ...prev, status: 'finished' } : prev));
        }
    }, [id, typingActivity]);

    useEffect(() => {
        setLoading(true);
        fetchEventById(id, 'activities')
            .then(async (data) => {
                setEvent(data);
                const activity = data?.activities?.find(isTypingRaceActivity);
                if (!activity) throw new Error('Typing race не знайдено');
                if (data.status === 'planned' || data.status === 'draft') {
                    navigate(`/events/${id}/lobby`, { replace: true });
                    return;
                }
                const initial = await fetchTypingState(id, activity.id);
                setState(initial);
            })
            .catch((err) => setError(err.message || 'Помилка'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    useEffect(() => {
        if (!typingActivity || event?.status === 'finished') return undefined;
        const timer = setInterval(() => {
            refresh().catch(() => {});
        }, 1200);
        return () => clearInterval(timer);
    }, [refresh, typingActivity, event?.status]);

    const handleType = async (char) => {
        if (!typingActivity || !state?.my_team_id) return;
        setTypeError('');
        try {
            const next = await sendTypedChar(id, typingActivity.id, state.my_team_id, char);
            setState(next);
            if (next.event?.status === 'finished') {
                setEvent((prev) => (prev ? { ...prev, status: 'finished' } : prev));
            }
        } catch (err) {
            setTypeError(err.message);
            throw err;
        }
    };

    const handleFinish = async () => {
        if (!typingActivity) return;
        try {
            await finishTypingRace(id, typingActivity.id);
            await refresh();
            setEvent((prev) => (prev ? { ...prev, status: 'finished' } : prev));
        } catch (err) {
            setError(err.message);
        }
    };

    const isHost = canManageEvent(user, role, event);

    if (loading) return <p className="text-muted">Завантаження гри…</p>;

    if (error || !event || !state) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-red-500">{error || 'Гра недоступна'}</p>
                <Link to={`/events/${id}/lobby`} className="mt-4 inline-block text-sm font-semibold text-primary">← До лобі</Link>
            </div>
        );
    }

    const isFinished = event.status === 'finished' || state.activity?.ended_at;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <Link to={`/events/${id}/lobby`} className="text-sm font-semibold text-primary hover:opacity-80">← Лобі</Link>
                {isHost && !isFinished && (
                    <button
                        type="button"
                        onClick={handleFinish}
                        className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white"
                    >
                        Завершити достроково
                    </button>
                )}
            </div>

            <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <StatusBadge status={event.status} />
                <h2 className="mt-3 text-2xl font-extrabold">{event.title}</h2>
                <p className="mt-1 text-sm text-muted">{typingActivity?.title}</p>

                {!user && (
                    <p className="mt-4 text-sm text-muted">
                        <Link to="/login" className="font-semibold text-primary">Увійди</Link>, щоб друкувати за свою команду.
                    </p>
                )}

                {user && !state.my_team_id && !isFinished && (
                    <p className="mt-4 text-sm text-amber-600">
                        Ви не в команді — перейдіть у лобі та оберіть слот.
                    </p>
                )}

                {!isFinished && state.settings && (
                    <div className="mt-6">
                        <TypingRaceLive
                            settings={state.settings}
                            run={myRun}
                            canType={state.can_type}
                            onType={handleType}
                            error={typeError}
                        />
                    </div>
                )}

                {isFinished && leaderboard.length > 0 && (
                    <div className="mt-6">
                        <TeamLeaderboard teams={leaderboard} title="Результати" />
                        <Link
                            to={`/events/${id}`}
                            className="mt-6 inline-block text-sm font-semibold text-primary"
                        >
                            Сторінка заходу →
                        </Link>
                    </div>
                )}
            </section>

            {state.runs?.length > 0 && (
                <section className="rounded-2xl border border-border bg-surface p-5">
                    <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Прогрес команд</h3>
                    <ul className="mt-3 space-y-2">
                        {state.runs.map((run) => (
                            <li key={run.event_team_id} className="flex items-center justify-between rounded-xl bg-bg px-3 py-2 text-sm">
                                <span className="font-semibold">{run.team_name}</span>
                                <span className="text-muted">
                                    {run.is_finished
                                        ? 'Фініш'
                                        : `Сегмент ${run.current_segment_index + 1}/${run.total_segments}`}
                                </span>
                            </li>
                        ))}
                    </ul>
                </section>
            )}
        </div>
    );
}

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
import { formatRaceTime, getSlotColor, getSlotMeta, resolveTypingRaceActivity } from '../utils/typingRace';
import TypingRaceLive from '../components/typing/TypingRaceLive';
import StatusBadge from '../components/events/StatusBadge';

function PracticeTeamPanel({ members, activeSlot, mySlot, settings }) {
    if (!members?.length) return null;

    return (
        <div className="rounded-2xl border border-border bg-bg p-4">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted">Гравці команди</h3>
            <ul className="mt-3 space-y-2">
                {members.map((member) => {
                    const slotMeta = getSlotMeta(settings, member.slot_index);
                    const color = slotMeta?.color || getSlotColor(settings, member.slot_index);
                    const isMe = mySlot != null && Number(member.slot_index) === Number(mySlot);
                    const isActive = activeSlot != null && Number(member.slot_index) === Number(activeSlot);

                    return (
                        <li
                            key={member.user_id}
                            className={[
                                'flex items-center justify-between rounded-xl px-3 py-2 text-sm',
                                isActive ? 'bg-surface ring-2' : 'bg-surface/60',
                            ].join(' ')}
                            style={isActive ? { boxShadow: `0 0 0 2px ${color}` } : undefined}
                        >
                            <span className="flex items-center gap-2">
                                <span
                                    className="h-3 w-3 rounded-full"
                                    style={{ backgroundColor: color }}
                                    aria-hidden
                                />
                                <span className="font-semibold" style={{ color: isActive ? color : undefined }}>
                                    {member.name}
                                    {isMe ? ' · ви' : ''}
                                </span>
                            </span>
                            <span className="text-xs text-muted">
                                {slotMeta?.label || `Гравець ${Number(member.slot_index) + 1}`}
                                {isActive ? ' · зараз друкує' : ''}
                            </span>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}

export default function TypingRacePracticePage() {
    const { id } = useParams();
    const { user, loading: authLoading } = useAuth();

    const [event, setEvent] = useState(null);
    const [state, setState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');
    const [typeError, setTypeError] = useState('');
    const [startMode, setStartMode] = useState('team');

    const typingActivity = useMemo(
        () => resolveTypingRaceActivity(event?.activities),
        [event]
    );

    const refresh = useCallback(async () => {
        if (!typingActivity || !user) return;
        const next = await fetchPracticeState(id, typingActivity.id);
        setState(next);
    }, [id, typingActivity, user]);

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

    useEffect(() => {
        if (!state?.is_practice_active || !typingActivity) return undefined;
        const timer = setInterval(() => {
            refresh().catch(() => {});
        }, 1200);
        return () => clearInterval(timer);
    }, [refresh, state?.is_practice_active, typingActivity]);

    const handleStart = async (mode = startMode) => {
        if (!typingActivity) return;
        setBusy('start');
        setError('');
        try {
            const next = await startPracticeRun(id, typingActivity.id, mode);
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
    const isTeamPractice = state?.practice_mode === 'team';
    const teamMemberCount = state?.team_members?.length ?? 0;

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

                {user && state?.my_team_id && !practiceActive && !practiceFinished && (
                    <div className="mt-6 space-y-4">
                        <div>
                            <p className="text-sm font-semibold">Режим тренування</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                                <button
                                    type="button"
                                    onClick={() => setStartMode('team')}
                                    className={[
                                        'rounded-xl px-4 py-2 text-sm font-semibold transition',
                                        startMode === 'team'
                                            ? 'bg-accent text-white'
                                            : 'border border-border bg-bg hover:bg-surface',
                                    ].join(' ')}
                                >
                                    Командне · усі гравці
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setStartMode('solo')}
                                    className={[
                                        'rounded-xl px-4 py-2 text-sm font-semibold transition',
                                        startMode === 'solo'
                                            ? 'bg-accent text-white'
                                            : 'border border-border bg-bg hover:bg-surface',
                                    ].join(' ')}
                                >
                                    Соло · один проходить усе
                                </button>
                            </div>
                        </div>

                        <p className="text-sm text-muted">
                            {startMode === 'team'
                                ? 'Як у гонці: кожен гравець друкує лише свої кольорові фрагменти по черзі. Відкрийте цю сторінку в усіх учасників команди.'
                                : 'Один гравець проходить увесь текст самостійно — зручно для розминки.'}
                        </p>

                        {startMode === 'team' && teamMemberCount < 2 && (
                            <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                                Для командного режиму потрібно щонайменше 2 гравці в команді.
                            </p>
                        )}

                        <button
                            type="button"
                            onClick={() => handleStart(startMode)}
                            disabled={
                                busy === 'start'
                                || event?.status === 'active'
                                || (startMode === 'team' && teamMemberCount < 2)
                            }
                            className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                        >
                            {busy === 'start' ? 'Запуск…' : 'Почати тренування'}
                        </button>
                    </div>
                )}

                {user && state?.my_team_id && (practiceActive || practiceFinished) && (
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <span className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-muted">
                            {isTeamPractice ? 'Командне тренування' : 'Соло-тренування'}
                        </span>
                        <button
                            type="button"
                            onClick={handleReset}
                            disabled={busy === 'reset'}
                            className="rounded-xl border border-border bg-bg px-4 py-2 text-sm font-semibold hover:bg-surface disabled:opacity-50"
                        >
                            {busy === 'reset' ? '…' : 'Спробувати знову'}
                        </button>
                    </div>
                )}

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                {practiceFinished && state?.practice_run?.completion_time_ms != null && (
                    <p className="mt-4 rounded-xl bg-accent/10 px-4 py-3 text-sm font-semibold text-accent">
                        Тренувальний час: {formatRaceTime(state.practice_run.completion_time_ms)}
                    </p>
                )}

                {isTeamPractice && (practiceActive || practiceFinished) && (
                    <div className="mt-6">
                        <PracticeTeamPanel
                            members={state.team_members}
                            activeSlot={state.active_slot ?? state.practice_run?.active_slot}
                            mySlot={state.my_slot}
                            settings={state.settings}
                        />
                    </div>
                )}

                {practiceActive && state?.settings && (
                    <div className="mt-6">
                        <p className="mb-3 text-sm text-muted">
                            {isTeamPractice
                                ? 'Командне тренування: друкує лише гравець активного кольору. Інші бачать прогрес у реальному часі.'
                                : 'Соло: ви проходите весь текст самостійно. Кольори показують, за якого гравця кожен фрагмент.'}
                        </p>
                        <TypingRaceLive
                            settings={state.settings}
                            run={state.practice_run}
                            canType={state.can_type}
                            onType={handleType}
                            error={typeError}
                            mySlot={state.my_slot}
                            practiceMode
                            practiceRelayMode={isTeamPractice}
                        />
                    </div>
                )}
            </section>
        </div>
    );
}

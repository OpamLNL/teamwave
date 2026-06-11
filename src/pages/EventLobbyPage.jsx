import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    createEventTeam,
    fetchEventById,
    fetchEventTeams,
    fetchTypingState,
    finishTypingRace,
    joinEventById,
    joinEventTeamSlot,
    leaveEventTeam,
    markEventTeamReady,
    sendTypedChar,
    startTypingRace,
    updateEvent,
} from '../utils/events';
import { isTeamRelaySettings, isTypingRaceActivity } from '../utils/typingRace';
import TypingRacePreview from '../components/typing/TypingRacePreview';
import TeamLeaderboard from '../components/typing/TeamLeaderboard';
import TypingRaceLive from '../components/typing/TypingRaceLive';
import StatusBadge from '../components/events/StatusBadge';

export default function EventLobbyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [event, setEvent] = useState(null);
    const [teams, setTeams] = useState([]);
    const [typingState, setTypingState] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');

    const typingActivity = useMemo(
        () => event?.activities?.find(isTypingRaceActivity),
        [event]
    );
    const teamSize = typingActivity?.settings?.team_size ?? 4;
    const isHost = user && event && (
        Number(user.id) === Number(event.organizer_id)
        || Number(user.id) === Number(event.host_id)
        || user.role === 'admin'
    );
    const myTeam = teams.find((t) => t.members?.some((m) => Number(m.user_id) === Number(user?.id)));
    const isFinished = event?.status === 'finished';

    const loadAll = useCallback(async () => {
        const data = await fetchEventById(id, 'all');
        setEvent(data);
        const teamList = await fetchEventTeams(id);
        setTeams(Array.isArray(teamList) ? teamList : []);

        const activity = data?.activities?.find(isTypingRaceActivity);
        if (activity) {
            try {
                const state = await fetchTypingState(id, activity.id);
                setTypingState(state);
            } catch {
                setTypingState(null);
            }
        }
    }, [id]);

    useEffect(() => {
        setLoading(true);
        loadAll()
            .catch((err) => setError(err.message || 'Помилка завантаження'))
            .finally(() => setLoading(false));
    }, [loadAll]);

    useEffect(() => {
        if (!typingActivity || !event) return undefined;
        if (!['planned', 'active'].includes(event.status)) return undefined;

        const timer = setInterval(async () => {
            try {
                const state = await fetchTypingState(id, typingActivity.id);
                setTypingState(state);
                if (state.activity?.is_active && !state.activity?.ended_at) {
                    navigate(`/events/${id}/play`, { replace: true });
                }
                if (state.event?.status === 'finished') {
                    setEvent((prev) => (prev ? { ...prev, status: 'finished' } : prev));
                }
            } catch {
                /* ignore polling errors */
            }
        }, 2000);

        return () => clearInterval(timer);
    }, [id, typingActivity, event, navigate]);

    const ensureJoined = async () => {
        if (!user) throw new Error('Увійдіть, щоб приєднатися');
        await joinEventById(id);
    };

    const handleCreateTeam = async (e) => {
        e.preventDefault();
        setBusy('create');
        setError('');
        try {
            await ensureJoined();
            await createEventTeam(id, teamName.trim());
            setTeamName('');
            await loadAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleJoinSlot = async (teamId, slotIndex) => {
        setBusy(`slot-${teamId}-${slotIndex}`);
        setError('');
        try {
            await ensureJoined();
            await joinEventTeamSlot(id, teamId, slotIndex);
            await loadAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleLeaveTeam = async (teamId) => {
        setBusy('leave');
        setError('');
        try {
            await leaveEventTeam(id, teamId);
            await loadAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleReady = async (teamId) => {
        setBusy('ready');
        setError('');
        try {
            await markEventTeamReady(id, teamId);
            await loadAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleOpenLobby = async () => {
        setBusy('open');
        setError('');
        try {
            await updateEvent(id, { status: 'planned' });
            await loadAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleStartRace = async () => {
        if (!typingActivity) return;
        setBusy('start');
        setError('');
        try {
            await startTypingRace(id, typingActivity.id);
            navigate(`/events/${id}/play`);
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    const handleFinishRace = async () => {
        if (!typingActivity) return;
        setBusy('finish');
        setError('');
        try {
            await finishTypingRace(id, typingActivity.id);
            await loadAll();
        } catch (err) {
            setError(err.message);
        } finally {
            setBusy('');
        }
    };

    if (loading) return <p className="text-muted">Завантаження лобі…</p>;

    if (error && !event) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-red-500">{error}</p>
                <Link to="/events" className="mt-4 inline-block text-sm font-semibold text-primary">← До заходів</Link>
            </div>
        );
    }

    const readyTeams = teams.filter((t) => t.status === 'ready' || t.members_count >= teamSize);
    const finishedTeams = teams
        .filter((t) => t.completion_time_ms != null)
        .sort((a, b) => a.completion_time_ms - b.completion_time_ms)
        .map((t, index) => ({
            team_id: t.id,
            team_name: t.name,
            completion_time_ms: t.completion_time_ms,
            rank_position: index + 1,
        }));

    return (
        <div className="space-y-6">
            <Link to={`/events/${id}`} className="text-sm font-semibold text-primary hover:opacity-80">← Деталі заходу</Link>

            <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <StatusBadge status={event.status} />
                        <h2 className="mt-3 text-2xl font-extrabold">{event.title}</h2>
                        <p className="mt-2 text-sm text-muted">Код: <span className="font-mono font-bold">{event.join_code}</span></p>
                    </div>
                    {!isFinished && isHost && (
                        <div className="flex flex-wrap gap-2">
                            {event.status === 'draft' && (
                                <button
                                    type="button"
                                    onClick={handleOpenLobby}
                                    disabled={Boolean(busy)}
                                    className="rounded-xl bg-bg px-4 py-2 text-sm font-semibold hover:bg-primary/10"
                                >
                                    Відкрити реєстрацію
                                </button>
                            )}
                            {event.status === 'planned' && (
                                <button
                                    type="button"
                                    onClick={handleStartRace}
                                    disabled={Boolean(busy) || readyTeams.length === 0}
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                                >
                                    Старт гонки
                                </button>
                            )}
                            {event.status === 'active' && (
                                <button
                                    type="button"
                                    onClick={handleFinishRace}
                                    disabled={Boolean(busy)}
                                    className="rounded-xl bg-red-500/90 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                                >
                                    Завершити гонку
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {typingActivity?.settings && isTeamRelaySettings(typingActivity.settings) && (
                    <div className="mt-6">
                        <TypingRacePreview settings={typingActivity.settings} compact />
                    </div>
                )}

                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </section>

            {!isFinished && (
                <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8 space-y-6">
                    <div>
                        <h3 className="text-lg font-bold">Команди ({teams.length})</h3>
                        <p className="text-sm text-muted">Створіть команду або оберіть вільний слот · потрібно {teamSize} гравців</p>
                    </div>

                    {user && !myTeam && (
                        <form onSubmit={handleCreateTeam} className="flex flex-wrap gap-3">
                            <input
                                value={teamName}
                                onChange={(e) => setTeamName(e.target.value)}
                                placeholder="Назва нової команди"
                                className="min-w-[220px] flex-1 rounded-2xl border border-border bg-bg px-4 py-2.5 outline-none focus:border-primary"
                            />
                            <button
                                type="submit"
                                disabled={busy === 'create' || !teamName.trim()}
                                className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                Створити команду
                            </button>
                        </form>
                    )}

                    {teams.length === 0 && (
                        <p className="text-sm text-muted">Поки немає команд — створіть першу.</p>
                    )}

                    <div className="space-y-4">
                        {teams.map((team) => {
                            const isMine = Number(myTeam?.id) === Number(team.id);
                            const isCaptain = Number(team.captain_user_id) === Number(user?.id);
                            const slots = Array.from({ length: teamSize }, (_, slot) => {
                                const member = team.members?.find((m) => m.slot_index === slot);
                                return { slot, member };
                            });

                            return (
                                <article key={team.id} className="rounded-2xl border border-border bg-bg p-4">
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div>
                                            <h4 className="font-bold">{team.name}</h4>
                                            <p className="text-xs text-muted">
                                                {team.members_count}/{teamSize} · {team.status}
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {isMine && team.status === 'open' && (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReady(team.id)}
                                                        disabled={busy === 'ready' || team.members_count < teamSize}
                                                        className="rounded-xl bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-50"
                                                    >
                                                        Готові
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleLeaveTeam(team.id)}
                                                        disabled={busy === 'leave'}
                                                        className="rounded-xl bg-surface px-3 py-1.5 text-xs font-semibold text-muted"
                                                    >
                                                        Покинути
                                                    </button>
                                                </>
                                            )}
                                            {isCaptain && team.status === 'ready' && (
                                                <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                                    Очікуємо старт
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                        {slots.map(({ slot, member }) => (
                                            <button
                                                key={slot}
                                                type="button"
                                                disabled={
                                                    Boolean(member)
                                                    || (myTeam && Number(myTeam.id) !== Number(team.id))
                                                    || !['planned', 'draft'].includes(event.status)
                                                }
                                                onClick={() => handleJoinSlot(team.id, slot)}
                                                className="rounded-xl border border-border bg-surface px-3 py-2 text-left text-sm disabled:cursor-default disabled:opacity-80 hover:border-primary/40"
                                            >
                                                <span className="text-xs text-muted">Слот {slot + 1}</span>
                                                <p className="font-semibold truncate">
                                                    {member?.user_name || (myTeam ? 'Вільно' : 'Приєднатися')}
                                                </p>
                                            </button>
                                        ))}
                                    </div>
                                </article>
                            );
                        })}
                    </div>

                    {!user && (
                        <p className="text-sm text-muted">
                            <Link to="/login" className="font-semibold text-primary">Увійди</Link>, щоб створити або приєднатися до команди.
                        </p>
                    )}
                </section>
            )}

            {isFinished && finishedTeams.length > 0 && (
                <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                    <TeamLeaderboard teams={finishedTeams} title="Підсумки гонки" />
                    <Link
                        to={`/events/${id}`}
                        className="mt-6 inline-block text-sm font-semibold text-primary"
                    >
                        Переглянути сторінку заходу →
                    </Link>
                </section>
            )}
        </div>
    );
}

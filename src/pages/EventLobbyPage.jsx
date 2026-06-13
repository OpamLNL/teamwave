import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    fetchEventById,
    fetchEventTeams,
    fetchTypingState,
    finishTypingRace,
    startTypingRace,
    updateEvent,
} from '../utils/events';
import { canManageEvent } from '../utils/permissions';
import { isTeamRelaySettings, isTypingRaceActivity, resolveTypingRaceActivity } from '../utils/typingRace';
import EventTeamRegistration from '../components/events/EventTeamRegistration';
import TypingRacePreview from '../components/typing/TypingRacePreview';
import TeamLeaderboard from '../components/typing/TeamLeaderboard';
import StatusBadge from '../components/events/StatusBadge';

export default function EventLobbyPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, role } = useAuth();

    const [event, setEvent] = useState(null);
    const [teams, setTeams] = useState([]);
    const [typingState, setTypingState] = useState(null);
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');

    const typingActivity = useMemo(
        () => resolveTypingRaceActivity(event?.activities),
        [event]
    );
    const teamSize = typingActivity?.settings?.team_size ?? 4;
    const isHost = canManageEvent(user, role, event);
    const isFinished = event?.status === 'finished';

    const loadAll = useCallback(async () => {
        const data = await fetchEventById(id, 'all');
        setEvent(data);

        const teamData = await fetchEventTeams(id);
        setTeams(teamData.teams);

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

    const readyTeams = teams.filter((t) => t.status === 'ready');
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
                <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                    <EventTeamRegistration
                        eventId={id}
                        event={event}
                        user={user}
                        teamSize={teamSize}
                        onTeamsChanged={setTeams}
                    />
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

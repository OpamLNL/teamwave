import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AuthorLink from '../AuthorLink/AuthorLink';
import {
    acceptTeamJoinRequest,
    cancelTeamJoinRequest,
    createEventTeam,
    declineTeamJoinRequest,
    fetchEventTeams,
    joinEventById,
    joinEventTeamSlot,
    leaveEventTeam,
    markEventTeamReady,
} from '../../utils/events';

const TEAM_STATUS_LABELS = {
    open: 'Набір',
    ready: 'Готова',
    racing: 'У грі',
    finished: 'Фініш',
};

export default function EventTeamRegistration({
    eventId,
    event,
    user,
    teamSize = 4,
    onTeamsChanged,
    showPracticeLink = true,
}) {
    const [teams, setTeams] = useState([]);
    const [myPendingRequest, setMyPendingRequest] = useState(null);
    const [teamName, setTeamName] = useState('');
    const [loading, setLoading] = useState(true);
    const [busy, setBusy] = useState('');
    const [error, setError] = useState('');

    const registrationOpen = ['draft', 'planned'].includes(event?.status);
    const myTeam = teams.find((t) => t.members?.some((m) => Number(m.user_id) === Number(user?.id)));
    const onTeamsChangedRef = useRef(onTeamsChanged);
    onTeamsChangedRef.current = onTeamsChanged;

    const loadTeams = useCallback(async () => {
        const data = await fetchEventTeams(eventId);
        setTeams(data.teams);
        setMyPendingRequest(data.my_pending_request);
        onTeamsChangedRef.current?.(data.teams);
        return data;
    }, [eventId]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        loadTeams()
            .catch((err) => {
                if (!cancelled) setError(err.message || 'Не вдалося завантажити команди');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [loadTeams, user?.id]);

    const ensureJoined = async () => {
        if (!user) throw new Error('Увійдіть, щоб приєднатися');
        await joinEventById(eventId);
    };

    const runAction = async (key, action) => {
        setBusy(key);
        setError('');
        try {
            await action();
            await loadTeams();
        } catch (err) {
            setError(err.message || 'Помилка');
        } finally {
            setBusy('');
        }
    };

    const handleCreateTeam = (e) => {
        e.preventDefault();
        runAction('create', async () => {
            await ensureJoined();
            await createEventTeam(eventId, teamName.trim());
            setTeamName('');
        });
    };

    const handleRequestJoin = (teamId, slotIndex) => {
        runAction(`req-${teamId}-${slotIndex}`, async () => {
            await ensureJoined();
            await joinEventTeamSlot(eventId, teamId, slotIndex);
        });
    };

    const getPendingForSlot = (team, slot) =>
        team.pending_requests?.find((r) => Number(r.slot_index) === slot && r.status === 'pending');

    if (loading) {
        return <p className="text-sm text-muted">Завантаження команд…</p>;
    }

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h3 className="text-lg font-bold">
                        Команди
                        <span className="ml-2 text-sm font-semibold text-muted">({teams.length})</span>
                    </h3>
                    <p className="mt-1 text-sm text-muted">
                        Створіть команду або надішліть запит капітану · потрібно {teamSize} гравців
                    </p>
                </div>
                {showPracticeLink && myTeam && event?.status !== 'finished' && event?.status !== 'active' && (
                    <Link
                        to={`/events/${eventId}/practice`}
                        className="rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent hover:bg-accent/15"
                    >
                        Тренування
                    </Link>
                )}
            </div>

            {!registrationOpen && (
                <p className="rounded-xl border border-border bg-bg px-4 py-3 text-sm text-muted">
                    Реєстрація команд закрита — захід уже розпочався або завершений.
                </p>
            )}

            {registrationOpen && !user && (
                <p className="rounded-xl border border-dashed border-border bg-bg px-4 py-3 text-sm text-muted">
                    <Link to="/login" className="font-semibold text-primary">Увійдіть</Link>, щоб створити або приєднатися до команди.
                </p>
            )}

            {registrationOpen && user && !myTeam && !myPendingRequest && (
                <form onSubmit={handleCreateTeam} className="flex flex-wrap gap-3">
                    <input
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="Назва вашої команди"
                        className="min-w-[220px] flex-1 rounded-2xl border border-border bg-bg px-4 py-2.5 outline-none focus:border-primary"
                    />
                    <button
                        type="submit"
                        disabled={busy === 'create' || !teamName.trim()}
                        className="rounded-2xl bg-primary px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                    >
                        {busy === 'create' ? 'Створення…' : 'Створити команду'}
                    </button>
                </form>
            )}

            {registrationOpen && user && myTeam && (
                <p className="rounded-xl bg-primary/5 px-4 py-3 text-sm text-primary">
                    Ви в команді «{myTeam.name}».
                    {Number(myTeam.captain_user_id) === Number(user.id)
                        ? ' Приймайте запити колег нижче.'
                        : ' Очікуйте, поки капітан підтвердить готовність команди.'}
                </p>
            )}

            {registrationOpen && user && myPendingRequest && !myTeam && (
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm">
                    <p className="text-amber-900">
                        Запит на вступ надіслано · очікуємо рішення капітана
                    </p>
                    <button
                        type="button"
                        disabled={busy === 'cancel-req'}
                        onClick={() => runAction('cancel-req', () => cancelTeamJoinRequest(eventId, myPendingRequest.event_team_id))}
                        className="rounded-lg border border-amber-300 px-3 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100"
                    >
                        Скасувати запит
                    </button>
                </div>
            )}

            {teams.length === 0 ? (
                <p className="text-sm text-muted">Поки немає команд — створіть першу.</p>
            ) : (
                <div className="space-y-4">
                    {teams.map((team) => {
                        const isMine = Number(myTeam?.id) === Number(team.id);
                        const isCaptain = Number(team.captain_user_id) === Number(user?.id);
                        const slots = Array.from({ length: teamSize }, (_, slot) => ({
                            slot,
                            member: team.members?.find((m) => m.slot_index === slot),
                            pending: getPendingForSlot(team, slot),
                        }));

                        return (
                            <article
                                key={team.id}
                                className={`rounded-2xl border bg-bg p-4 ${
                                    isMine ? 'border-primary/40 ring-1 ring-primary/20' : 'border-border'
                                }`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <h4 className="font-bold">{team.name}</h4>
                                        <p className="text-xs text-muted">
                                            {team.members_count}/{teamSize} · {TEAM_STATUS_LABELS[team.status] || team.status}
                                            {team.captain_name ? ` · капітан ${team.captain_name}` : ''}
                                        </p>
                                    </div>
                                    {registrationOpen && isMine && team.status === 'open' && (
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                type="button"
                                                onClick={() => runAction('ready', () => markEventTeamReady(eventId, team.id))}
                                                disabled={busy === 'ready' || team.members_count < teamSize}
                                                className="rounded-xl bg-accent/15 px-3 py-1.5 text-xs font-semibold text-accent disabled:opacity-50"
                                            >
                                                Команда готова
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => runAction('leave', () => leaveEventTeam(eventId, team.id))}
                                                disabled={busy === 'leave'}
                                                className="rounded-xl bg-surface px-3 py-1.5 text-xs font-semibold text-muted"
                                            >
                                                Покинути
                                            </button>
                                        </div>
                                    )}
                                    {registrationOpen && isCaptain && team.status === 'ready' && (
                                        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                                            Очікуємо старт
                                        </span>
                                    )}
                                </div>

                                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                                    {slots.map(({ slot, member, pending }) => (
                                        <div key={slot} className="rounded-xl border border-border bg-surface p-3">
                                            <p className="text-xs text-muted">Гравець {slot + 1}</p>
                                            {member ? (
                                                <div className="mt-1">
                                                    <AuthorLink
                                                        userId={member.user_id}
                                                        name={member.user_name}
                                                        avatarUrl={member.user_avatar}
                                                        avatarClassName="h-8 w-8 rounded-lg object-cover border border-border shrink-0"
                                                        className="gap-2"
                                                    />
                                                </div>
                                            ) : pending ? (
                                                <div className="mt-2 space-y-2">
                                                    <AuthorLink
                                                        userId={pending.user_id}
                                                        name={pending.user_name}
                                                        avatarUrl={pending.user_avatar}
                                                        avatarClassName="h-7 w-7 rounded-lg object-cover border border-border shrink-0"
                                                        className="gap-2"
                                                    />
                                                    <p className="text-[11px] font-semibold text-amber-700">Запит на вступ</p>
                                                    {isCaptain && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                type="button"
                                                                disabled={Boolean(busy)}
                                                                onClick={() => runAction(`acc-${pending.id}`, () => acceptTeamJoinRequest(eventId, team.id, pending.id))}
                                                                className="flex-1 rounded-lg bg-primary px-2 py-1 text-[11px] font-semibold text-white"
                                                            >
                                                                Так
                                                            </button>
                                                            <button
                                                                type="button"
                                                                disabled={Boolean(busy)}
                                                                onClick={() => runAction(`dec-${pending.id}`, () => declineTeamJoinRequest(eventId, team.id, pending.id))}
                                                                className="flex-1 rounded-lg bg-bg px-2 py-1 text-[11px] font-semibold text-muted"
                                                            >
                                                                Ні
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            ) : registrationOpen && user && !myTeam && !myPendingRequest ? (
                                                <button
                                                    type="button"
                                                    disabled={Boolean(busy)}
                                                    onClick={() => handleRequestJoin(team.id, slot)}
                                                    className="mt-2 w-full rounded-lg bg-primary/10 px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/15 disabled:opacity-50"
                                                >
                                                    {busy === `req-${team.id}-${slot}` ? '…' : 'Надіслати запит'}
                                                </button>
                                            ) : (
                                                <p className="mt-2 text-sm font-semibold text-muted">Вільно</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </article>
                        );
                    })}
                </div>
            )}

            {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
    );
}

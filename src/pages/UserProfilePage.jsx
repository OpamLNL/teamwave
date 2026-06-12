import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { endpoints } from '../api/config';
import { apiGet } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mapEventForCard } from '../utils/events';
import {
    acceptTeammateInvite,
    cancelTeammateInvite,
    declineTeammateInvite,
    fetchConnectionStatus,
    fetchIncomingTeammateRequests,
    fetchTeammates,
    fetchUserTeams,
    removeTeammate,
    sendTeammateInvite,
    updateMyProfile,
    uploadMyAvatar,
} from '../utils/teammates';
import EventCard from '../components/events/EventCard';
import UserAvatar from '../components/UserAvatar/UserAvatar';
import AvatarEditor from '../components/UserAvatar/AvatarEditor';

const ROLE_LABELS = {
    participant: 'Учасник',
    host: 'Ведучий',
    organizer: 'Організатор',
    admin: 'Адміністратор',
};

function parseInterests(value) {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    try {
        const parsed = JSON.parse(value);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function TeammateCard({ member }) {
    return (
        <Link
            to={`/users/${member.id}`}
            className="flex items-center gap-3 rounded-2xl border border-border bg-bg px-4 py-3 transition hover:border-primary/40 hover:bg-surface"
        >
            <UserAvatar src={member.avatar_url} userId={member.id} name={member.name} className="h-11 w-11 rounded-xl object-cover" />
            <div className="min-w-0">
                <p className="font-semibold truncate">{member.name}</p>
                <p className="text-xs text-muted truncate">
                    {member.position || ROLE_LABELS[member.role] || member.role}
                    {member.company ? ` · ${member.company}` : ''}
                </p>
            </div>
        </Link>
    );
}

export default function UserProfilePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser, loading: authLoading, updateProfile } = useAuth();

    const [profile, setProfile] = useState(null);
    const [events, setEvents] = useState([]);
    const [teammates, setTeammates] = useState([]);
    const [orgTeams, setOrgTeams] = useState([]);
    const [connection, setConnection] = useState({ status: 'guest' });
    const [incomingRequests, setIncomingRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [actionMessage, setActionMessage] = useState('');
    const [editing, setEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        bio: '',
        company: '',
        position: '',
    });

    const isOwnProfile = useMemo(
        () => currentUser && profile && Number(currentUser.id) === Number(profile.id),
        [currentUser, profile]
    );

    const loadProfile = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const [user, userEvents, userTeammates, userTeams] = await Promise.all([
                apiGet(endpoints.users.byId(id)),
                apiGet(endpoints.users.events(id)),
                fetchTeammates(id),
                fetchUserTeams(id),
            ]);

            setProfile(user);
            setEvents(Array.isArray(userEvents) ? userEvents.map(mapEventForCard) : []);
            setTeammates(userTeammates);
            setOrgTeams(userTeams);
            setEditForm({
                name: user.name || '',
                bio: user.bio || '',
                company: user.company || '',
                position: user.position || '',
            });

            if (currentUser) {
                const [status, incoming] = await Promise.all([
                    fetchConnectionStatus(id),
                    Number(currentUser.id) === Number(id)
                        ? fetchIncomingTeammateRequests()
                        : Promise.resolve([]),
                ]);
                setConnection(status);
                setIncomingRequests(Array.isArray(incoming) ? incoming : []);
            } else {
                setConnection({ status: 'guest' });
                setIncomingRequests([]);
            }
        } catch (err) {
            setError(err.message || 'Профіль не знайдено');
        } finally {
            setLoading(false);
        }
    }, [id, currentUser]);

    useEffect(() => {
        if (authLoading) return;
        loadProfile();
    }, [authLoading, loadProfile]);

    const runAction = async (action) => {
        setActionLoading(true);
        setActionMessage('');
        try {
            await action();
            await loadProfile();
        } catch (err) {
            setActionMessage(err.message || 'Помилка');
        } finally {
            setActionLoading(false);
        }
    };

    const handleSaveProfile = async (event) => {
        event.preventDefault();
        await runAction(async () => {
            const updated = await updateMyProfile(editForm);
            setProfile(updated);
            updateProfile({
                name: updated.name,
                bio: updated.bio,
                company: updated.company,
                position: updated.position,
            });
            setEditing(false);
            setActionMessage('Профіль оновлено');
        });
    };

    const interests = parseInterests(profile?.interests);

    if (loading || authLoading) {
        return <p className="text-muted">Завантаження…</p>;
    }

    if (error || !profile) {
        return (
            <div className="rounded-2xl border border-border bg-surface p-8 text-center">
                <p className="text-red-500">{error || 'Користувача не знайдено'}</p>
                <Link to="/" className="mt-4 inline-block text-primary font-semibold">На головну</Link>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <section className="rounded-[1.75rem] border border-border bg-surface p-6 sm:p-8">
                <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-4 min-w-0">
                        {isOwnProfile ? (
                            <AvatarEditor
                                user={profile}
                                onUpdated={(updated) => {
                                    setProfile(updated);
                                    updateProfile({ avatar_url: updated.avatar_url });
                                    setActionMessage('Аватар оновлено');
                                }}
                            />
                        ) : (
                            <UserAvatar
                                src={profile.avatar_url}
                                userId={profile.id}
                                name={profile.name}
                                className="h-20 w-20 rounded-2xl object-cover"
                            />
                        )}
                        <div className="min-w-0">
                            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                                {isOwnProfile ? 'Мій профіль' : 'Профіль учасника'}
                            </p>
                            <h1 className="text-3xl font-extrabold truncate">{profile.name}</h1>
                            <p className="text-muted">
                                {profile.company || 'TeamWave'}
                                {profile.position ? ` · ${profile.position}` : ''}
                                {' · '}
                                {ROLE_LABELS[profile.role] || profile.role}
                            </p>
                            {isOwnProfile && profile.email && (
                                <p className="mt-1 text-sm text-muted">{profile.email}</p>
                            )}
                            {profile.bio && !editing && (
                                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted">{profile.bio}</p>
                            )}
                            {interests.length > 0 && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                    {interests.map((item) => (
                                        <span
                                            key={item}
                                            className="rounded-full bg-bg px-3 py-1 text-xs font-semibold text-muted"
                                        >
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {isOwnProfile ? (
                            <button
                                type="button"
                                onClick={() => setEditing((value) => !value)}
                                className="rounded-xl border border-border bg-bg px-4 py-2 text-sm font-semibold hover:bg-surface"
                            >
                                {editing ? 'Скасувати' : 'Редагувати'}
                            </button>
                        ) : connection.status === 'guest' ? (
                            <button
                                type="button"
                                onClick={() => navigate('/login', { state: { from: `/users/${id}` } })}
                                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                            >
                                Увійти, щоб запросити
                            </button>
                        ) : connection.status === 'none' ? (
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => runAction(() => sendTeammateInvite(id))}
                                className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                            >
                                Запросити в команду
                            </button>
                        ) : connection.status === 'pending_sent' ? (
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => runAction(() => cancelTeammateInvite(id))}
                                className="rounded-xl border border-border bg-bg px-4 py-2 text-sm font-semibold hover:bg-surface disabled:opacity-60"
                            >
                                Скасувати запрошення
                            </button>
                        ) : connection.status === 'pending_received' ? (
                            <>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => runAction(() => acceptTeammateInvite(id))}
                                    className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                                >
                                    Прийняти
                                </button>
                                <button
                                    type="button"
                                    disabled={actionLoading}
                                    onClick={() => runAction(() => declineTeammateInvite(id))}
                                    className="rounded-xl border border-border bg-bg px-4 py-2 text-sm font-semibold hover:bg-surface disabled:opacity-60"
                                >
                                    Відхилити
                                </button>
                            </>
                        ) : connection.status === 'accepted' ? (
                            <button
                                type="button"
                                disabled={actionLoading}
                                onClick={() => runAction(() => removeTeammate(id))}
                                className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-100 disabled:opacity-60"
                            >
                                Видалити з команди
                            </button>
                        ) : null}
                    </div>
                </div>

                {actionMessage && (
                    <p className="mt-4 text-sm font-medium text-primary">{actionMessage}</p>
                )}

                {editing && isOwnProfile && (
                    <form onSubmit={handleSaveProfile} className="mt-6 grid gap-4 rounded-2xl border border-border bg-bg p-4 sm:grid-cols-2">
                        <label className="block sm:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-muted">Імʼя</span>
                            <input
                                value={editForm.name}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                            />
                        </label>
                        <label className="block sm:col-span-2">
                            <span className="mb-1 block text-xs font-semibold text-muted">Про себе</span>
                            <textarea
                                value={editForm.bio}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, bio: e.target.value }))}
                                rows={3}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-xs font-semibold text-muted">Компанія</span>
                            <input
                                value={editForm.company}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, company: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                            />
                        </label>
                        <label className="block">
                            <span className="mb-1 block text-xs font-semibold text-muted">Посада</span>
                            <input
                                value={editForm.position}
                                onChange={(e) => setEditForm((prev) => ({ ...prev, position: e.target.value }))}
                                className="w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm"
                            />
                        </label>
                        <div className="sm:col-span-2">
                            <button
                                type="submit"
                                disabled={actionLoading}
                                className="rounded-xl bg-primary px-5 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
                            >
                                Зберегти профіль
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl bg-bg p-4 text-center">
                        <p className="text-xs text-muted">Бали</p>
                        <p className="text-2xl font-bold">{profile.points ?? 0}</p>
                    </div>
                    <div className="rounded-xl bg-bg p-4 text-center">
                        <p className="text-xs text-muted">Рівень</p>
                        <p className="text-2xl font-bold">{profile.level ?? 1}</p>
                    </div>
                    <div className="rounded-xl bg-bg p-4 text-center">
                        <p className="text-xs text-muted">У команді</p>
                        <p className="text-2xl font-bold">{profile.teammates_count ?? teammates.length}</p>
                    </div>
                    <div className="rounded-xl bg-bg p-4 text-center">
                        <p className="text-xs text-muted">Заходів</p>
                        <p className="text-2xl font-bold">{events.length}</p>
                    </div>
                </div>
            </section>

            {isOwnProfile && incomingRequests.length > 0 && (
                <section className="rounded-[1.75rem] border border-border bg-surface p-6">
                    <h2 className="text-xl font-extrabold mb-4">Запрошення в команду</h2>
                    <div className="space-y-3">
                        {incomingRequests.map((request) => (
                            <div
                                key={request.id}
                                className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-bg px-4 py-3"
                            >
                                <Link to={`/users/${request.from_user_id}`} className="flex items-center gap-3 min-w-0">
                                    <UserAvatar
                                        src={request.from_user_avatar}
                                        userId={request.from_user_id}
                                        name={request.from_user_name}
                                        className="h-10 w-10 rounded-xl object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{request.from_user_name}</p>
                                        <p className="text-xs text-muted">Хоче додати вас у команду</p>
                                    </div>
                                </Link>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => runAction(() => acceptTeammateInvite(request.from_user_id))}
                                        className="rounded-xl bg-primary px-3 py-2 text-sm font-semibold text-white"
                                    >
                                        Прийняти
                                    </button>
                                    <button
                                        type="button"
                                        disabled={actionLoading}
                                        onClick={() => runAction(() => declineTeammateInvite(request.from_user_id))}
                                        className="rounded-xl border border-border px-3 py-2 text-sm font-semibold"
                                    >
                                        Відхилити
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <h2 className="text-xl font-extrabold mb-4">
                    {isOwnProfile ? 'Моя команда' : 'Команда користувача'}
                </h2>
                {teammates.length === 0 ? (
                    <p className="text-sm text-muted">
                        {isOwnProfile
                            ? 'Поки нікого у команді. Запросіть колег з їхніх профілів.'
                            : 'У цього користувача поки немає учасників команди.'}
                    </p>
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {teammates.map((member) => (
                            <TeammateCard key={member.id} member={member} />
                        ))}
                    </div>
                )}
            </section>

            {orgTeams.length > 0 && (
                <section>
                    <h2 className="text-xl font-extrabold mb-4">Корпоративні команди</h2>
                    <div className="grid gap-3 sm:grid-cols-2">
                        {orgTeams.map((team) => (
                            <div key={team.id} className="rounded-2xl border border-border bg-surface p-4">
                                <p className="font-bold">{team.name}</p>
                                {team.company_name && (
                                    <p className="text-sm text-muted mt-1">{team.company_name}</p>
                                )}
                                {team.description && (
                                    <p className="text-sm text-muted mt-2">{team.description}</p>
                                )}
                            </div>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h2 className="text-xl font-extrabold">
                        {isOwnProfile ? 'Мої заходи' : 'Заходи користувача'}
                    </h2>
                    {isOwnProfile && (
                        <Link to="/events" className="text-sm font-semibold text-primary">
                            Усі заходи
                        </Link>
                    )}
                </div>
                {events.length === 0 ? (
                    <p className="text-muted text-sm">Заходів поки немає.</p>
                ) : (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

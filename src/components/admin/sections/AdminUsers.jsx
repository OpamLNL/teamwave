import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../../api/config';
import { authFetch } from '../../../utils/authFetch';
import { parseApiList } from '../../../api/client';
import { AdminTable, ActionButton, selectClass } from '../adminUtils';

export default function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await authFetch(endpoints.admin.users);
        const data = res.ok ? await res.json() : [];
        setUsers(parseApiList(data));
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const updateRole = async (id, role) => {
        const res = await authFetch(endpoints.admin.userRole(id), {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        });
        if (res.ok) load();
    };

    const toggleBlock = async (id, isBlocked) => {
        const res = await authFetch(endpoints.admin.userBlock(id), {
            method: 'PATCH',
            body: JSON.stringify({ is_blocked: !isBlocked }),
        });
        if (res.ok) load();
    };

    const remove = async (id) => {
        if (!window.confirm('Видалити користувача назавжди?')) return;
        const res = await authFetch(endpoints.admin.userDelete(id), { method: 'DELETE' });
        if (res.ok) load();
    };

    const filtered = users.filter(
        (u) =>
            !search.trim() ||
            u.name?.toLowerCase().includes(search.toLowerCase()) ||
            u.email?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Користувачі</h2>
            <input
                type="search"
                placeholder="Пошук за імʼям або email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-sm rounded-xl border border-border bg-bg px-3 py-2 text-sm"
            />
            {loading ? (
                <p className="text-muted">Завантаження…</p>
            ) : (
                <AdminTable columns={['ID', 'Імʼя', 'Email', 'Роль', 'Блок', 'Дії']}>
                    {filtered.map((u) => (
                        <tr key={u.id} className="hover:bg-bg/50">
                            <td className="px-4 py-3">{u.id}</td>
                            <td className="px-4 py-3 font-medium">
                                <Link to={`/users/${u.id}`} className="text-primary hover:underline">
                                    {u.name || '—'}
                                </Link>
                            </td>
                            <td className="px-4 py-3 text-muted">{u.email || '—'}</td>
                            <td className="px-4 py-3">
                                <select
                                    className={`${selectClass} !py-1 !text-xs`}
                                    value={(u.role || 'participant').toLowerCase()}
                                    onChange={(e) => updateRole(u.id, e.target.value)}
                                >
                                    <option value="participant">participant</option>
                                    <option value="host">host</option>
                                    <option value="organizer">organizer</option>
                                    <option value="admin">admin</option>
                                </select>
                            </td>
                            <td className="px-4 py-3">
                                <ActionButton
                                    variant={u.is_blocked ? 'danger' : 'default'}
                                    onClick={() => toggleBlock(u.id, u.is_blocked)}
                                >
                                    {u.is_blocked ? 'Заблокований' : 'Активний'}
                                </ActionButton>
                            </td>
                            <td className="px-4 py-3">
                                <ActionButton variant="danger" onClick={() => remove(u.id)}>
                                    Видалити
                                </ActionButton>
                            </td>
                        </tr>
                    ))}
                </AdminTable>
            )}
        </div>
    );
}

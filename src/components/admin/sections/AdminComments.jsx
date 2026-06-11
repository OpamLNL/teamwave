import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../../api/config';
import { authFetch } from '../../../utils/authFetch';
import { parseApiList } from '../../../api/client';
import {
    AdminTable,
    ActionButton,
    StatusBadge,
    targetTypeLabel,
    targetLink,
    selectClass,
} from '../adminUtils';

export default function AdminComments() {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);

    const load = async () => {
        setLoading(true);
        const res = await authFetch(endpoints.admin.comments);
        const data = res.ok ? await res.json() : [];
        setComments(parseApiList(data));
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const updateStatus = async (id, status) => {
        const res = await authFetch(endpoints.admin.commentStatus(id), {
            method: 'PATCH',
            body: JSON.stringify({ status }),
        });
        if (res.ok) load();
    };

    const remove = async (id) => {
        if (!window.confirm('Видалити коментар?')) return;
        const res = await authFetch(endpoints.admin.commentDelete(id), { method: 'DELETE' });
        if (res.ok) load();
    };

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Коментарі</h2>

            {loading ? (
                <p className="text-muted">Завантаження…</p>
            ) : (
                <AdminTable columns={['ID', 'Автор', 'Ціль', 'Текст', 'Статус', 'Дата', 'Дії']}>
                    {comments.map((c) => {
                        const link = targetLink(c.target_type, c.target_id);
                        return (
                            <tr key={c.id} className="hover:bg-bg/50">
                                <td className="px-4 py-3">{c.id}</td>
                                <td className="px-4 py-3 text-muted">{c.author_name || `#${c.user_id}`}</td>
                                <td className="px-4 py-3">
                                    {targetTypeLabel(c.target_type)} #{c.target_id}
                                    {link && (
                                        <>
                                            {' · '}
                                            <Link to={link} className="text-primary font-semibold">
                                                →
                                            </Link>
                                        </>
                                    )}
                                </td>
                                <td className="px-4 py-3 max-w-xs truncate" title={c.content}>
                                    {c.content}
                                </td>
                                <td className="px-4 py-3">
                                    <StatusBadge status={c.status || 'active'} />
                                </td>
                                <td className="px-4 py-3 text-muted whitespace-nowrap">
                                    {c.created_at ? new Date(c.created_at).toLocaleString() : '—'}
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex flex-wrap gap-1">
                                        <select
                                            className={`${selectClass} !py-1 !text-xs w-24`}
                                            value={c.status || 'active'}
                                            onChange={(e) => updateStatus(c.id, e.target.value)}
                                        >
                                            <option value="active">active</option>
                                            <option value="hidden">hidden</option>
                                            <option value="blocked">blocked</option>
                                        </select>
                                        <ActionButton variant="danger" onClick={() => remove(c.id)}>
                                            ✕
                                        </ActionButton>
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </AdminTable>
            )}
        </div>
    );
}

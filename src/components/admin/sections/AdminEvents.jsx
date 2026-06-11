import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../../api/config';
import { authFetch } from '../../../utils/authFetch';

const STATUS_OPTIONS = ['draft', 'planned', 'active', 'finished'];

export default function AdminEvents() {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const load = () => {
        setLoading(true);
        authFetch(endpoints.admin.events)
            .then((r) => {
                if (!r.ok) throw new Error('Не вдалося завантажити заходи');
                return r.json();
            })
            .then((data) => setEvents(Array.isArray(data) ? data : []))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    };

    useEffect(load, []);

    const updateStatus = async (id, status) => {
        const res = await authFetch(endpoints.admin.eventStatus(id), {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        if (res.ok) load();
    };

    const remove = async (id) => {
        if (!window.confirm('Видалити захід?')) return;
        const res = await authFetch(endpoints.admin.eventDelete(id), { method: 'DELETE' });
        if (res.ok) load();
    };

    if (loading) return <p className="text-muted">Завантаження…</p>;
    if (error) return <p className="text-red-500 text-sm">{error}</p>;

    return (
        <div className="space-y-4">
            <h2 className="text-xl font-bold">Заходи</h2>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-border text-left text-muted">
                            <th className="py-2 pr-3">ID</th>
                            <th className="py-2 pr-3">Назва</th>
                            <th className="py-2 pr-3">Код</th>
                            <th className="py-2 pr-3">Статус</th>
                            <th className="py-2 pr-3">Дії</th>
                        </tr>
                    </thead>
                    <tbody>
                        {events.map((event) => (
                            <tr key={event.id} className="border-b border-border/60">
                                <td className="py-3 pr-3">{event.id}</td>
                                <td className="py-3 pr-3">
                                    <Link to={`/events/${event.id}`} className="font-semibold text-primary hover:opacity-80">{event.title}</Link>
                                </td>
                                <td className="py-3 pr-3 font-mono">{event.join_code}</td>
                                <td className="py-3 pr-3">
                                    <select
                                        value={event.status}
                                        onChange={(e) => updateStatus(event.id, e.target.value)}
                                        className="rounded-lg border border-border bg-bg px-2 py-1"
                                    >
                                        {STATUS_OPTIONS.map((s) => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </td>
                                <td className="py-3 pr-3">
                                    <button type="button" onClick={() => remove(event.id)} className="text-red-500 font-semibold">Видалити</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

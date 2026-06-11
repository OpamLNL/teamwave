import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { endpoints } from '../../../api/config';
import { authFetch } from '../../../utils/authFetch';

function StatCard({ label, value, highlight }) {
    return (
        <div className={`rounded-2xl border p-5 ${highlight ? 'border-primary bg-primary/5' : 'border-border bg-surface'}`}>
            <p className="text-2xl font-extrabold text-primary">{value ?? 0}</p>
            <p className="text-sm text-muted mt-1">{label}</p>
        </div>
    );
}

export default function AdminDashboard({ onOpenEvents }) {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        authFetch(endpoints.admin.stats)
            .then((r) => (r.ok ? r.json() : null))
            .then(setStats)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <p className="text-muted">Завантаження…</p>;

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-xl font-bold mb-4">Огляд платформи</h2>
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
                    <StatCard label="Користувачі" value={stats?.users_count} />
                    <StatCard label="Заходи" value={stats?.events_count} />
                    <StatCard label="Шаблони" value={stats?.templates_count} />
                    <StatCard label="Учасники" value={stats?.participants_count} />
                    <StatCard label="Коментарі" value={stats?.comments_count} />
                    <StatCard label="Активні зараз" value={stats?.active_events_count} highlight={(stats?.active_events_count ?? 0) > 0} />
                </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm">
                <button type="button" onClick={onOpenEvents} className="text-primary font-semibold hover:opacity-80">Керування заходами →</button>
                <Link to="/events" className="text-primary font-semibold hover:opacity-80">Публічний календар</Link>
                <Link to="/templates" className="text-primary font-semibold hover:opacity-80">Шаблони</Link>
            </div>
        </div>
    );
}

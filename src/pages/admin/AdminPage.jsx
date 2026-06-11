import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { canCreateEvents, resolveUserRole } from '../../utils/permissions';
import AdminGuard from '../../components/admin/AdminGuard';
import AdminDashboard from '../../components/admin/sections/AdminDashboard';
import AdminUsers from '../../components/admin/sections/AdminUsers';
import AdminEvents from '../../components/admin/sections/AdminEvents';
import AdminComments from '../../components/admin/sections/AdminComments';

const SECTIONS = [
    { id: 'dashboard', label: 'Огляд', icon: '📊', roles: ['admin', 'organizer'] },
    { id: 'events', label: 'Заходи', icon: '◉', roles: ['admin', 'organizer'] },
    { id: 'comments', label: 'Коментарі', icon: '🗨', roles: ['admin', 'organizer'] },
    { id: 'users', label: 'Користувачі', icon: '👥', roles: ['admin'] },
];

function AdminContent() {
    const { user, role } = useAuth();
    const userRole = resolveUserRole(user, role);
    const available = SECTIONS.filter((s) => s.roles.includes(userRole));
    const [section, setSection] = useState(available[0]?.id || 'dashboard');

    const renderSection = () => {
        switch (section) {
            case 'dashboard':
                return <AdminDashboard onOpenEvents={() => setSection('events')} />;
            case 'events':
                return <AdminEvents />;
            case 'comments':
                return <AdminComments />;
            case 'users':
                return <AdminUsers />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                        {userRole === 'admin' ? 'Адмінпанель' : 'Керування заходами'}
                    </h1>
                    <p className="text-sm text-muted mt-1">TeamWave — заходи, користувачі, модерація</p>
                </div>
                {canCreateEvents(user, role) && (
                    <Link
                        to="/events/create"
                        className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
                    >
                        ＋ Створити захід
                    </Link>
                )}
            </header>

            <div className="flex flex-col lg:flex-row gap-6">
                <nav className="lg:w-56 shrink-0">
                    <ul className="flex lg:flex-col gap-1 overflow-x-auto pb-2 lg:pb-0">
                        {available.map((item) => (
                            <li key={item.id}>
                                <button
                                    type="button"
                                    onClick={() => setSection(item.id)}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-semibold transition whitespace-nowrap ${
                                        section === item.id
                                            ? 'bg-primary text-white'
                                            : 'text-muted hover:bg-surface hover:text-text border border-transparent hover:border-border'
                                    }`}
                                >
                                    <span className="mr-2">{item.icon}</span>
                                    {item.label}
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="flex-1 min-w-0 rounded-3xl border border-border bg-surface p-5 sm:p-6">
                    {renderSection()}
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    return (
        <AdminGuard>
            <AdminContent />
        </AdminGuard>
    );
}

import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { mainNav, personalNav, secondaryNav } from '../../config/navigation';
import { canCreateEvents } from '../../utils/permissions';
import UserAvatar from '../UserAvatar/UserAvatar';

function NavItem({ to, label, icon, end, onNavigate }) {
    return (
        <NavLink
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
                [
                    'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                    isActive
                        ? 'bg-sidebar-active text-white shadow-lg shadow-black/20'
                        : 'text-sidebar-muted hover:bg-sidebar-hover hover:text-white',
                ].join(' ')
            }
        >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/5 text-base group-hover:bg-white/10">
                {icon}
            </span>
            <span>{label}</span>
        </NavLink>
    );
}

function NavSection({ title, children }) {
    return (
        <div className="space-y-1">
            {title && (
                <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-sidebar-muted">
                    {title}
                </p>
            )}
            {children}
        </div>
    );
}

export default function Sidebar({ mobileOpen, onClose }) {
    const { user, role, logout } = useAuth();
    const isStaff = role === 'admin' || role === 'organizer';
    const canCreateEventsFlag = canCreateEvents(user, role);

    const sidebarContent = (
        <div className="flex h-full flex-col">
            <div className="flex items-center gap-3 border-b border-white/10 px-5 py-5">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl shadow-lg shadow-primary/30">
                    🌊
                </div>
                <div>
                    <Link to="/" onClick={onClose} className="block text-lg font-extrabold tracking-tight text-white">
                        TeamWave
                    </Link>
                    <p className="text-xs text-sidebar-muted">remote team building</p>
                </div>
            </div>

            <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
                <NavSection title="Платформа">
                    {mainNav.map((item) => (
                        <NavItem key={item.to} {...item} onNavigate={onClose} />
                    ))}
                </NavSection>

                {canCreateEventsFlag && (
                    <NavSection title="Організація">
                        <NavItem to="/events/create" label="Створити захід" icon="＋" onNavigate={onClose} />
                    </NavSection>
                )}

                {user && (
                    <NavSection title="Особисте">
                        {personalNav.map((item) => (
                            <NavItem key={item.to} {...item} onNavigate={onClose} />
                        ))}
                    </NavSection>
                )}

                <NavSection title="Довідка">
                    {secondaryNav.map((item) => (
                        <NavItem key={item.to} {...item} onNavigate={onClose} />
                    ))}
                    {isStaff && (
                        <NavItem to="/admin" label={role === 'admin' ? 'Адмінпанель' : 'Керування'} icon="⚙" onNavigate={onClose} />
                    )}
                </NavSection>
            </nav>

            <div className="border-t border-white/10 p-4">
                {user ? (
                    <div className="rounded-2xl bg-white/5 p-3">
                        <Link
                            to={`/users/${user.id}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-xl transition hover:bg-white/5"
                        >
                            <UserAvatar
                                src={user.avatar_url}
                                name={user.name}
                                className="h-10 w-10 rounded-xl object-cover border border-white/10"
                            />
                            <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold text-white">{user.name}</p>
                                <p className="truncate text-xs text-sidebar-muted">{user.email}</p>
                            </div>
                        </Link>
                        <button
                            type="button"
                            onClick={logout}
                            className="mt-3 w-full rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-sidebar-muted transition hover:bg-white/5 hover:text-white"
                        >
                            Вийти
                        </button>
                    </div>
                ) : (
                    <Link
                        to="/login"
                        onClick={onClose}
                        className="flex w-full items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white transition hover:opacity-90"
                    >
                        Увійти
                    </Link>
                )}
            </div>
        </div>
    );

    return (
        <>
            <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-[17.5rem] lg:flex-col bg-sidebar">
                {sidebarContent}
            </aside>

            {mobileOpen && (
                <button
                    type="button"
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={onClose}
                    aria-label="Закрити меню"
                />
            )}

            <aside
                className={[
                    'fixed inset-y-0 left-0 z-50 flex w-[17.5rem] flex-col bg-sidebar transition-transform duration-300 lg:hidden',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full',
                ].join(' ')}
            >
                {sidebarContent}
            </aside>
        </>
    );
}

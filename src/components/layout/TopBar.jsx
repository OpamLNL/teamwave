import { Link, useLocation } from 'react-router-dom';
import NotificationBell from '../NotificationBell/NotificationBell';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { pageTitles } from '../../config/navigation';

function resolveTitle(pathname) {
    if (pageTitles[pathname]) return pageTitles[pathname];
    if (pathname.startsWith('/events/')) return 'Захід';
    if (pathname.startsWith('/users/')) return 'Профіль';
    return 'TeamWave';
}

export default function TopBar({ onMenuClick }) {
    const { pathname } = useLocation();
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const title = resolveTitle(pathname);

    return (
        <header className="sticky top-0 z-30 border-b border-border/80 bg-bg/85 backdrop-blur-md">
            <div className="flex items-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface text-lg transition hover:bg-bg lg:hidden"
                    aria-label="Відкрити меню"
                >
                    ☰
                </button>

                <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium uppercase tracking-wider text-muted">TeamWave</p>
                    <h1 className="truncate text-lg font-extrabold tracking-tight sm:text-xl">{title}</h1>
                </div>

                <div className="flex items-center gap-2 sm:gap-3">
                    {!user && (
                        <Link
                            to="/login"
                            className="hidden rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:inline-flex"
                        >
                            Увійти
                        </Link>
                    )}
                    <Link
                        to="/join"
                        className="hidden rounded-xl border border-border bg-surface px-4 py-2 text-sm font-semibold transition hover:bg-bg sm:inline-flex"
                    >
                        + Код заходу
                    </Link>
                    <button
                        type="button"
                        onClick={toggleTheme}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-surface transition hover:bg-bg"
                        aria-label="Перемкнути тему"
                    >
                        {theme === 'dark' ? '☀️' : '🌙'}
                    </button>
                    {user && <NotificationBell />}
                </div>
            </div>
        </header>
    );
}

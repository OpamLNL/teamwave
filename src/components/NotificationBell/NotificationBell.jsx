import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { fetchUnreadCount } from '../../utils/notifications';

export default function NotificationBell() {
    const { user } = useAuth();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (!user?.id) {
            setCount(0);
            return undefined;
        }

        let cancelled = false;

        async function load() {
            try {
                const n = await fetchUnreadCount();
                if (!cancelled) setCount(n);
            } catch {
                if (!cancelled) setCount(0);
            }
        }

        load();
        const interval = setInterval(load, 60000);

        return () => {
            cancelled = true;
            clearInterval(interval);
        };
    }, [user?.id]);

    if (!user) return null;

    return (
        <Link
            to="/notifications"
            className="relative inline-flex items-center justify-center w-9 h-9 rounded-full border border-border bg-bg hover:bg-surface transition"
            title="Сповіщення"
            aria-label={`Сповіщення${count > 0 ? `, ${count} нових` : ''}`}
        >
            <span className="text-base leading-none" aria-hidden="true">
                🔔
            </span>
            {count > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[1.1rem] h-[1.1rem] px-1 rounded-full bg-accent text-white text-[10px] font-bold flex items-center justify-center">
                    {count > 99 ? '99+' : count}
                </span>
            )}
        </Link>
    );
}

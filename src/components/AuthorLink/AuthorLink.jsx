import { Link } from 'react-router-dom';
import UserAvatar from '../UserAvatar/UserAvatar';

export default function AuthorLink({
    userId,
    name,
    avatarUrl,
    className = '',
    avatarClassName = 'w-7 h-7 rounded-full object-cover border border-border shrink-0',
}) {
    if (!userId) return null;

    const label = name || `Користувач #${userId}`;

    return (
        <Link
            to={`/users/${userId}`}
            className={`inline-flex items-center gap-2 min-w-0 hover:opacity-80 transition ${className}`}
        >
            <UserAvatar src={avatarUrl} userId={userId} name={label} className={avatarClassName} />
            <span className="text-sm font-semibold text-text truncate">{label}</span>
        </Link>
    );
}

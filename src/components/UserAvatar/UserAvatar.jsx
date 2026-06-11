import { useEffect, useState } from 'react';
import { resolveMediaUrl } from '../../utils/mediaUrl';

function DefaultAvatarGraphic({ className, label }) {
    return (
        <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={className}
            role="img"
            aria-label={label}
        >
            <rect width="64" height="64" rx="32" fill="#E2E8F0" />
            <circle cx="32" cy="24" r="10" fill="#94A3B8" />
            <path d="M12 56c0-11 9-20 20-20s20 9 20 20" fill="#94A3B8" />
        </svg>
    );
}

function hasAvatar(src) {
    if (src == null) return false;
    if (typeof src === 'string' && !src.trim()) return false;
    return true;
}

export function getAvatarUrl(src) {
    if (!hasAvatar(src)) return null;
    return resolveMediaUrl(src.trim());
}

export default function UserAvatar({
    src,
    name,
    className = 'w-8 h-8 rounded-full object-cover border border-border shrink-0',
}) {
    const [failed, setFailed] = useState(false);
    const avatarUrl = hasAvatar(src) && !failed ? getAvatarUrl(src) : null;

    useEffect(() => {
        setFailed(false);
    }, [src]);

    if (!avatarUrl) {
        return (
            <DefaultAvatarGraphic
                className={`${className} object-cover`}
                label={name ? `Аватар ${name}` : 'Аватар за замовчуванням'}
            />
        );
    }

    return (
        <img
            src={avatarUrl}
            alt={name ? `Аватар ${name}` : 'Аватар'}
            className={className}
            onError={() => setFailed(true)}
        />
    );
}

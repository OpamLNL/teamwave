import { useState } from 'react';
import { resolveEventIcon } from '../../utils/eventIcons';

export default function EventCoverImage({
    coverUrl,
    icon,
    className = 'h-full w-full object-cover',
    wrapperClassName = '',
    fallbackClassName = 'flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10',
    iconClassName = 'text-6xl',
}) {
    const [failed, setFailed] = useState(false);
    const resolvedIcon = icon || '📅';

    if (!coverUrl || failed) {
        return (
            <div className={fallbackClassName}>
                <span className={iconClassName}>{resolvedIcon}</span>
            </div>
        );
    }

    return (
        <img
            src={coverUrl}
            alt=""
            className={className}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setFailed(true)}
        />
    );
}

export function EventCoverHero({ coverUrl, event, className = 'h-44 w-full sm:h-52' }) {
    return (
        <div className={`overflow-hidden ${className}`}>
            <EventCoverImage
                coverUrl={coverUrl}
                icon={resolveEventIcon(event)}
                fallbackClassName={`flex ${className} items-center justify-center bg-gradient-to-br from-primary/15 to-accent/10`}
            />
        </div>
    );
}

import { SERVER_BASE_URL as CONFIG_SERVER_BASE_URL } from '../api/config';

const LOCALHOST_PATTERN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;
const PRODUCTION_SERVER_FALLBACK = 'https://teamwave-server.vercel.app';

function getMediaBaseUrl() {
    const fromEnv = CONFIG_SERVER_BASE_URL?.trim();
    if (fromEnv && !LOCALHOST_PATTERN.test(fromEnv)) {
        return fromEnv.replace(/\/+$/, '');
    }
    if (import.meta.env.PROD) {
        return PRODUCTION_SERVER_FALLBACK;
    }
    return (fromEnv || 'http://localhost:3000').replace(/\/+$/, '');
}

export function resolveMediaUrl(url) {
    if (url == null) return null;

    const trimmed = String(url).trim();
    if (!trimmed) return null;

    // Локальний preview (File → createObjectURL) — не чіпати
    if (/^(blob:|data:)/i.test(trimmed)) {
        return trimmed;
    }

    const base = getMediaBaseUrl();

    if (LOCALHOST_PATTERN.test(trimmed)) {
        const pathname = trimmed.replace(LOCALHOST_PATTERN, '');
        return `${base}${pathname.startsWith('/') ? pathname : `/${pathname}`}`;
    }

    if (/^https?:\/\//i.test(trimmed)) {
        return trimmed;
    }

    return `${base}${trimmed.startsWith('/') ? trimmed : `/${trimmed}`}`;
}

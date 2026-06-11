export const EVENT_CREATOR_ROLES = ['admin', 'organizer', 'host'];

export function resolveUserRole(user, role) {
    let value = role || user?.role;

    if (!value && user?.id) {
        try {
            const saved = JSON.parse(localStorage.getItem('user') || '{}');
            if (Number(saved?.id) === Number(user.id) && saved?.role) {
                value = saved.role;
            }
        } catch {
            /* ignore */
        }
    }

    if (!value) {
        value = localStorage.getItem('role');
    }

    return String(value || 'participant').trim().toLowerCase();
}

export function canCreateEvents(user, role) {
    if (!user) return false;
    return EVENT_CREATOR_ROLES.includes(resolveUserRole(user, role));
}

export function canManageEvent(user, role, event) {
    if (!user || !event) return false;
    const userRole = resolveUserRole(user, role);
    if (userRole === 'admin') return true;
    if (['organizer', 'host'].includes(userRole)) {
        return Number(event.organizer_id) === Number(user.id)
            || Number(event.host_id) === Number(user.id);
    }
    return false;
}

export function getCreateEventPath(templateId, user) {
    const base = templateId
        ? `/events/create?template=${templateId}`
        : '/events/create';
    if (user) return base;
    return `/login?redirect=${encodeURIComponent(base)}`;
}

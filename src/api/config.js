const PRODUCTION_API_FALLBACK = 'https://teamwave-server.vercel.app';

function resolveServerBaseUrl() {
    const fromEnv = import.meta.env.VITE_SERVER_BASE_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/+$/, '');
    if (import.meta.env.PROD) return PRODUCTION_API_FALLBACK;
    return 'http://localhost:3000';
}

function resolveApiBaseUrl() {
    const fromEnv = import.meta.env.VITE_API_BASE_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/+$/, '');
    if (import.meta.env.PROD) return `${PRODUCTION_API_FALLBACK}/api`;
    return 'http://localhost:3000/api';
}

function resolveAuthBaseUrl() {
    const fromEnv = import.meta.env.VITE_AUTH_BASE_URL?.trim();
    if (fromEnv) return fromEnv.replace(/\/+$/, '');
    if (import.meta.env.PROD) return `${PRODUCTION_API_FALLBACK}/routes/auth`;
    return 'http://localhost:3000/routes/auth';
}

export const API_BASE_URL = resolveApiBaseUrl();
export const SERVER_BASE_URL = resolveServerBaseUrl();
export const AUTH_BASE_URL = resolveAuthBaseUrl();

export const isProductionApi =
    import.meta.env.PROD
    && Boolean(import.meta.env.VITE_API_BASE_URL?.trim())
    && !String(import.meta.env.VITE_API_BASE_URL).includes('localhost');

export const endpoints = {
    auth: {
        firebase: `${AUTH_BASE_URL}/firebase`,
    },
    users: {
        list: `${API_BASE_URL}/users`,
        popular: `${API_BASE_URL}/users/popular`,
        me: `${API_BASE_URL}/users/me`,
        meEvents: `${API_BASE_URL}/users/me/events`,
        meComments: `${API_BASE_URL}/users/me/comments`,
        meCommentsReceived: `${API_BASE_URL}/users/me/comments/received`,
        meAvatar: `${API_BASE_URL}/users/me/avatar`,
        byId: (id) => `${API_BASE_URL}/users/${id}`,
        avatar: (id) => `${API_BASE_URL}/users/${id}/avatar`,
        byFirebase: (uid) => `${API_BASE_URL}/users/firebase/${uid}`,
        events: (id) => `${API_BASE_URL}/users/${id}/events`,
        comments: (id) => `${API_BASE_URL}/users/${id}/comments`,
        stats: (id) => `${API_BASE_URL}/users/${id}/stats`,
        teams: (id) => `${API_BASE_URL}/users/${id}/teams`,
    },
    teammates: {
        byUser: (userId) => `${API_BASE_URL}/teammates/users/${userId}`,
        status: (userId) => `${API_BASE_URL}/teammates/users/${userId}/status`,
        incoming: `${API_BASE_URL}/teammates/me/incoming`,
        invite: (userId) => `${API_BASE_URL}/teammates/users/${userId}/invite`,
        accept: (userId) => `${API_BASE_URL}/teammates/users/${userId}/accept`,
        decline: (userId) => `${API_BASE_URL}/teammates/users/${userId}/decline`,
        remove: (userId) => `${API_BASE_URL}/teammates/users/${userId}`,
    },
    events: {
        list: `${API_BASE_URL}/events`,
        my: `${API_BASE_URL}/events/me`,
        create: `${API_BASE_URL}/events`,
        cover: (id) => `${API_BASE_URL}/events/${id}/cover`,
        byId: (id) => `${API_BASE_URL}/events/${id}`,
        byCode: (code) => `${API_BASE_URL}/events/code/${code}`,
        update: (id) => `${API_BASE_URL}/events/${id}`,
        delete: (id) => `${API_BASE_URL}/events/${id}`,
        join: (id) => `${API_BASE_URL}/events/${id}/join`,
        joinByCode: `${API_BASE_URL}/events/join`,
        leave: (id) => `${API_BASE_URL}/events/${id}/leave`,
        activities: (id) => `${API_BASE_URL}/events/${id}/activities`,
        participants: (id) => `${API_BASE_URL}/events/${id}/participants`,
        teamLeaderboard: (id) => `${API_BASE_URL}/events/${id}/team-leaderboard`,
        fromTemplate: (templateId) => `${API_BASE_URL}/events/from-template/${templateId}`,
        teams: (id) => `${API_BASE_URL}/events/${id}/teams`,
        teamJoin: (eventId, teamId) => `${API_BASE_URL}/events/${eventId}/teams/${teamId}/join`,
        teamReady: (eventId, teamId) => `${API_BASE_URL}/events/${eventId}/teams/${teamId}/ready`,
        typingState: (eventId, activityId) => `${API_BASE_URL}/events/${eventId}/activities/${activityId}/typing-state`,
        typingStart: (eventId, activityId) => `${API_BASE_URL}/events/${eventId}/activities/${activityId}/start`,
        typingType: (eventId, activityId) => `${API_BASE_URL}/events/${eventId}/activities/${activityId}/type`,
        typingFinish: (eventId, activityId) => `${API_BASE_URL}/events/${eventId}/activities/${activityId}/finish`,
    },
    templates: {
        list: `${API_BASE_URL}/event-templates`,
        byId: (id) => `${API_BASE_URL}/event-templates/${id}`,
    },
    comments: {
        list: (targetType, targetId) => `${API_BASE_URL}/comments/${targetType}/${targetId}`,
        create: `${API_BASE_URL}/comments`,
        byId: (id) => `${API_BASE_URL}/comments/single/${id}`,
    },
    likes: {
        toggle: `${API_BASE_URL}/likes/toggle`,
        count: `${API_BASE_URL}/likes/count`,
        byUser: (userId) => `${API_BASE_URL}/likes/user/${userId}`,
    },
    favorites: {
        toggle: `${API_BASE_URL}/favorites/toggle`,
        me: `${API_BASE_URL}/favorites/me`,
        meItems: `${API_BASE_URL}/favorites/me/items`,
        byUser: (userId) => `${API_BASE_URL}/favorites/user/${userId}`,
    },
    notifications: {
        me: `${API_BASE_URL}/notifications/me`,
        unreadCount: `${API_BASE_URL}/notifications/me/unread-count`,
        readAll: `${API_BASE_URL}/notifications/me/read-all`,
        read: (id) => `${API_BASE_URL}/notifications/${id}/read`,
    },
    admin: {
        stats: `${API_BASE_URL}/admin/stats`,
        events: `${API_BASE_URL}/admin/events`,
        eventStatus: (id) => `${API_BASE_URL}/admin/events/${id}/status`,
        eventDelete: (id) => `${API_BASE_URL}/admin/events/${id}`,
        comments: `${API_BASE_URL}/admin/comments`,
        commentStatus: (id) => `${API_BASE_URL}/admin/comments/${id}/status`,
        commentDelete: (id) => `${API_BASE_URL}/admin/comments/${id}`,
        users: `${API_BASE_URL}/admin/users`,
        userRole: (id) => `${API_BASE_URL}/admin/users/${id}/role`,
        userBlock: (id) => `${API_BASE_URL}/admin/users/${id}/block`,
        userDelete: (id) => `${API_BASE_URL}/admin/users/${id}`,
    },
    contact: {
        send: `${API_BASE_URL}/contact`,
    },
};

import { endpoints } from '../api/config';
import { apiGet } from '../api/client';
import { authFetch } from './authFetch';

async function parseAuthJson(res) {
    if (!res.ok) {
        const text = await res.text();
        try {
            const json = JSON.parse(text);
            throw new Error(json.error || text);
        } catch (err) {
            if (err instanceof Error && err.message) throw err;
            throw new Error(text || `HTTP ${res.status}`);
        }
    }
    return res.json();
}

export async function fetchEvents(params = {}) {
    const search = new URLSearchParams();
    if (params.status) search.set('status', params.status);
    if (params.type) search.set('type', params.type);
    if (params.search) search.set('search', params.search);
    if (params.is_public) search.set('is_public', params.is_public);

    const qs = search.toString();
    const url = qs ? `${endpoints.events.list}?${qs}` : endpoints.events.list;
    return apiGet(url);
}

export async function fetchEventById(id, include = 'activities') {
    const url = include
        ? `${endpoints.events.byId(id)}?include=${include}`
        : endpoints.events.byId(id);
    return apiGet(url);
}

export async function fetchEventByCode(code) {
    return apiGet(endpoints.events.byCode(code));
}

export async function fetchMyEvents() {
    return apiGet(endpoints.events.my);
}

export async function fetchTemplates(params = {}) {
    const search = new URLSearchParams();
    if (params.category) search.set('category', params.category);
    if (params.event_type) search.set('event_type', params.event_type);
    const qs = search.toString();
    const url = qs ? `${endpoints.templates.list}?${qs}` : endpoints.templates.list;
    return apiGet(url);
}

export async function fetchEventTeamLeaderboard(eventId) {
    return apiGet(endpoints.events.teamLeaderboard(eventId));
}

export async function fetchTemplateById(id) {
    return apiGet(`${endpoints.templates.byId(id)}?include=activities`);
}

export function mapEventForCard(event) {
    return {
        ...event,
        participants: event.participants_count ?? event.participants ?? 0,
    };
}

export async function createEventFromTemplate(templateId, body) {
    const res = await authFetch(endpoints.events.fromTemplate(templateId), {
        method: 'POST',
        body: JSON.stringify(body),
    });
    return parseAuthJson(res);
}

export async function joinEventById(eventId) {
    const res = await authFetch(endpoints.events.join(eventId), {
        method: 'POST',
        body: JSON.stringify({}),
    });
    return parseAuthJson(res);
}

export async function updateEvent(eventId, body) {
    const res = await authFetch(endpoints.events.update(eventId), {
        method: 'PUT',
        body: JSON.stringify(body),
    });
    return parseAuthJson(res);
}

export async function fetchEventTeams(eventId) {
    return apiGet(endpoints.events.teams(eventId));
}

export async function createEventTeam(eventId, name) {
    const res = await authFetch(endpoints.events.teams(eventId), {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
    return parseAuthJson(res);
}

export async function joinEventTeamSlot(eventId, teamId, slotIndex) {
    const res = await authFetch(endpoints.events.teamJoin(eventId, teamId), {
        method: 'POST',
        body: JSON.stringify({ slot_index: slotIndex }),
    });
    return parseAuthJson(res);
}

export async function leaveEventTeam(eventId, teamId) {
    const res = await authFetch(endpoints.events.teamJoin(eventId, teamId), {
        method: 'DELETE',
    });
    return parseAuthJson(res);
}

export async function markEventTeamReady(eventId, teamId) {
    const res = await authFetch(endpoints.events.teamReady(eventId, teamId), {
        method: 'POST',
        body: JSON.stringify({}),
    });
    return parseAuthJson(res);
}

export async function fetchTypingState(eventId, activityId) {
    const res = await authFetch(endpoints.events.typingState(eventId, activityId));
    return parseAuthJson(res);
}

export async function startTypingRace(eventId, activityId) {
    const res = await authFetch(endpoints.events.typingStart(eventId, activityId), {
        method: 'POST',
        body: JSON.stringify({}),
    });
    return parseAuthJson(res);
}

export async function sendTypedChar(eventId, activityId, eventTeamId, char) {
    const res = await authFetch(endpoints.events.typingType(eventId, activityId), {
        method: 'POST',
        body: JSON.stringify({ event_team_id: eventTeamId, char }),
    });
    return parseAuthJson(res);
}

export async function finishTypingRace(eventId, activityId) {
    const res = await authFetch(endpoints.events.typingFinish(eventId, activityId), {
        method: 'POST',
        body: JSON.stringify({}),
    });
    return parseAuthJson(res);
}

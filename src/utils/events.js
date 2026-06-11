import { endpoints } from '../api/config';
import { apiGet } from '../api/client';

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

export async function fetchEventParticipants(eventId) {
    return apiGet(endpoints.events.participants(eventId));
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

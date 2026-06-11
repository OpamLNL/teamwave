/** Нормалізує відповідь API: масив або { data: [] } від пагінації */
export function parseApiList(payload) {
    if (Array.isArray(payload)) return payload;
    if (payload?.data && Array.isArray(payload.data)) return payload.data;
    return [];
}

/** Метадані пагінації з відповіді API */
export function parseApiPagination(payload) {
    if (payload?.pagination) return payload.pagination;
    const total = parseApiList(payload).length;
    return { total, page: 1, limit: total, total_pages: 1 };
}

export async function parseApiErrorResponse(res) {
    return parseErrorResponse(res);
}

async function parseErrorResponse(res) {
    const text = await res.text();

    try {
        const json = JSON.parse(text);
        if (json?.error) {
            const err = new Error(json.error);
            err.status = res.status;
            if (json.requires_mature_consent) err.code = 'MATURE_CONTENT';
            return err;
        }
    } catch (parseErr) {
        if (parseErr?.code === 'MATURE_CONTENT') throw parseErr;
    }

    const err = new Error(text || `HTTP ${res.status}`);
    err.status = res.status;
    return err;
}

export async function apiGet(url, { useAuth = false } = {}) {
    const headers = {};

    if (useAuth) {
        const token = localStorage.getItem('token');
        if (token) headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, { headers });

    if (!res.ok) {
        throw await parseErrorResponse(res);
    }

    return res.json();
}

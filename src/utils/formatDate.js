export function formatDateTime(value, locale = 'uk-UA') {
    if (value == null || value === '') return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleString(locale);
}

export function formatPublishedDate(value) {
    if (value == null || value === '') return null;

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return null;

    return date.toLocaleDateString('uk-UA', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

export function getPublishedAt(workOrPost) {
    return workOrPost?.created_at ?? workOrPost?.date ?? null;
}

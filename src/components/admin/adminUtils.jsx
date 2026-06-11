const STATUS_LABELS = {
    active: 'Активний',
    hidden: 'Прихований',
    blocked: 'Заблокований',
};

const REPORT_STATUS_LABELS = {
    pending: 'Очікує',
    reviewed: 'Розглянуто',
    rejected: 'Відхилено',
    resolved: 'Вирішено',
};

export function contentStatusLabel(status) {
    return STATUS_LABELS[status] || status || '—';
}

export function reportStatusLabel(status) {
    return REPORT_STATUS_LABELS[status] || status || '—';
}

export function targetTypeLabel(type) {
    const map = {
        event: 'Захід',
        activity: 'Активність',
        submission: 'Відповідь',
        comment: 'Коментар',
        user: 'Користувач',
    };
    return map[type] || type;
}

export function targetLink(type, id) {
    if (type === 'event') return `/events/${id}`;
    if (type === 'activity') return '/events';
    if (type === 'user') return `/users/${id}`;
    return null;
}

export const inputClass =
    'w-full rounded-xl border border-border bg-bg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/30';

export const selectClass = inputClass;

export function AdminTable({ columns, children, emptyMessage = 'Немає записів' }) {
    return (
        <div className="overflow-x-auto rounded-2xl border border-border">
            <table className="min-w-full text-sm">
                <thead>
                    <tr className="bg-bg border-b border-border text-left">
                        {columns.map((col) => (
                            <th key={col} className="px-4 py-3 font-semibold text-muted whitespace-nowrap">
                                {col}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                    {children}
                </tbody>
            </table>
            {!children && (
                <p className="text-center text-muted py-8 text-sm">{emptyMessage}</p>
            )}
        </div>
    );
}

export function StatusBadge({ status, kind = 'content' }) {
    const label = kind === 'report' ? reportStatusLabel(status) : contentStatusLabel(status);
    const colors = {
        active: 'bg-green-500/10 text-green-700 dark:text-green-400',
        hidden: 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400',
        blocked: 'bg-red-500/10 text-red-700 dark:text-red-400',
        pending: 'bg-orange-500/10 text-orange-700 dark:text-orange-400',
        reviewed: 'bg-blue-500/10 text-blue-700 dark:text-blue-400',
        rejected: 'bg-gray-500/10 text-gray-600',
        resolved: 'bg-green-500/10 text-green-700 dark:text-green-400',
    };
    return (
        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-semibold ${colors[status] || 'bg-bg text-muted'}`}>
            {label}
        </span>
    );
}

export function ActionButton({ children, variant = 'default', ...props }) {
    const variants = {
        default: 'border-border bg-bg hover:bg-surface text-text',
        primary: 'border-primary bg-primary text-white hover:opacity-90',
        danger: 'border-red-300 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/30 dark:text-red-400',
    };
    return (
        <button
            type="button"
            className={`px-2.5 py-1 rounded-lg border text-xs font-semibold transition ${variants[variant]}`}
            {...props}
        >
            {children}
        </button>
    );
}

import { statusLabels } from '../../data/eventConstants';

export default function StatusBadge({ status }) {
    const meta = statusLabels[status] || statusLabels.draft;

    return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${meta.className}`}>
            {meta.label}
        </span>
    );
}

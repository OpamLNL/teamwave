export default function TeamEventParameters({ settings, title = 'Параметри команд' }) {
    if (!settings) return null;

    const teamSize = settings.team_size ?? 4;
    const slots = Array.isArray(settings.slots) ? settings.slots : [];

    return (
        <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4 sm:p-5">
            <h4 className="text-sm font-bold uppercase tracking-wide text-primary">{title}</h4>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl bg-surface px-3 py-2">
                    <p className="text-xs text-muted">Гравців у команді</p>
                    <p className="text-lg font-bold">{teamSize}</p>
                </div>
                <div className="rounded-xl bg-surface px-3 py-2">
                    <p className="text-xs text-muted">Режим</p>
                    <p className="text-sm font-semibold">Командний relay</p>
                </div>
                <div className="rounded-xl bg-surface px-3 py-2">
                    <p className="text-xs text-muted">Вступ</p>
                    <p className="text-sm font-semibold">Запит → підтвердження капітана</p>
                </div>
            </div>

            {slots.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                    {slots.slice(0, teamSize).map((slot) => (
                        <span
                            key={slot.slot}
                            className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: slot.color || '#2563EB' }}
                            />
                            {slot.label || `Гравець ${slot.slot + 1}`}
                        </span>
                    ))}
                </div>
            )}

            {settings.rules?.length > 0 && (
                <ul className="mt-4 space-y-1 text-sm text-muted">
                    {settings.rules.map((rule) => (
                        <li key={rule} className="flex gap-2">
                            <span className="text-primary">•</span>
                            <span>{rule}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

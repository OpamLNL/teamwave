import { getSlotColor } from '../../utils/typingRace';

export default function TypingRacePreview({ settings, compact = false }) {
    if (!settings?.segments?.length) return null;

    return (
        <div className={compact ? 'space-y-3' : 'space-y-4'}>
            {!compact && settings.source_text && (
                <p className="text-sm text-muted">{settings.source_text}</p>
            )}

            <div className="rounded-2xl border border-border bg-bg px-4 py-4 font-mono text-sm leading-8">
                {settings.segments.map((segment, index) => {
                    const color = getSlotColor(settings, segment.slot);
                    if (segment.slot == null) {
                        return <span key={`${index}-space`}>{segment.text}</span>;
                    }
                    return (
                        <span
                            key={`${index}-${segment.text}`}
                            style={{ color, fontWeight: 700 }}
                            title={settings.slots?.find((s) => s.slot === segment.slot)?.label}
                        >
                            {segment.text}
                        </span>
                    );
                })}
            </div>

            {settings.slots?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {settings.slots.map((slot) => (
                        <span
                            key={slot.slot}
                            className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold"
                        >
                            <span
                                className="h-2.5 w-2.5 rounded-full"
                                style={{ backgroundColor: slot.color }}
                            />
                            {slot.label}
                        </span>
                    ))}
                </div>
            )}

            {settings.rules?.length > 0 && !compact && (
                <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                    {settings.rules.map((rule) => (
                        <li key={rule}>{rule}</li>
                    ))}
                </ul>
            )}
        </div>
    );
}

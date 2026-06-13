import { useEffect, useRef, useState } from 'react';
import { getSegmentOwnerSlot, getSlotColor, getSlotMeta } from '../../utils/typingRace';

function SlotLegend({ settings, mySlot, activeSlot }) {
    if (!settings?.slots?.length) return null;

    return (
        <div className="flex flex-wrap gap-2">
            {settings.slots.map((slot) => {
                const isMe = mySlot != null && Number(slot.slot) === Number(mySlot);
                const isActive = activeSlot != null && Number(slot.slot) === Number(activeSlot);

                return (
                    <span
                        key={slot.slot}
                        className={[
                            'inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold transition',
                            isMe || isActive ? 'bg-surface' : 'bg-surface/70 text-muted',
                        ].join(' ')}
                        style={
                            isMe || isActive
                                ? { boxShadow: `0 0 0 2px ${slot.color}` }
                                : undefined
                        }
                    >
                        <span
                            className="h-3 w-3 shrink-0 rounded-full border border-black/10"
                            style={{ backgroundColor: slot.color }}
                            aria-hidden
                        />
                        <span style={isMe || isActive ? { color: slot.color } : undefined}>
                            {slot.label}
                            {isMe ? ' · ви' : ''}
                        </span>
                    </span>
                );
            })}
        </div>
    );
}

function StatusBadge({ canType, practiceMode, mySlotMeta, activeSlotMeta, isFinished }) {
    if (isFinished) {
        return (
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                Команда фінішувала
            </span>
        );
    }

    if (canType && practiceMode && activeSlotMeta) {
        return (
            <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${activeSlotMeta.color}22`, color: activeSlotMeta.color }}
            >
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeSlotMeta.color }}
                />
                Тренування · зараз {activeSlotMeta.label.toLowerCase()}
            </span>
        );
    }

    if (canType && mySlotMeta) {
        return (
            <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${mySlotMeta.color}22`, color: mySlotMeta.color }}
            >
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: mySlotMeta.color }}
                />
                Ваш хід · {mySlotMeta.label.toLowerCase()}
            </span>
        );
    }

    if (activeSlotMeta) {
        return (
            <span className="inline-flex items-center gap-2 rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeSlotMeta.color }}
                />
                Очікуйте · зараз {activeSlotMeta.label.toLowerCase()}
            </span>
        );
    }

    return (
        <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
            Очікуйте свою чергу
        </span>
    );
}

export default function TypingRaceLive({
    settings,
    run,
    canType,
    onType,
    error,
    practiceMode = false,
    mySlot = null,
}) {
    const inputRef = useRef(null);
    const [localError, setLocalError] = useState('');

    useEffect(() => {
        if (canType && inputRef.current) {
            inputRef.current.focus();
        }
    }, [canType, run?.current_segment_index, run?.segment_typed_chars]);

    useEffect(() => {
        setLocalError(error || '');
    }, [error]);

    if (!settings?.segments?.length) return null;

    const segments = settings.segments;
    const currentIndex = run?.current_segment_index ?? 0;
    const typedChars = run?.segment_typed_chars ?? 0;
    const activeSlot = run?.is_finished ? null : getSegmentOwnerSlot(segments, currentIndex);
    const activeSlotMeta = getSlotMeta(settings, activeSlot);
    const mySlotMeta = getSlotMeta(settings, mySlot);
    const activeColor = activeSlotMeta?.color || getSlotColor(settings, activeSlot) || '#2563EB';

    const handleKeyDown = async (event) => {
        if (!canType || !onType) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key.length !== 1) return;

        event.preventDefault();
        setLocalError('');
        try {
            await onType(event.key);
            if (inputRef.current) inputRef.current.value = '';
        } catch (err) {
            setLocalError(err.message || 'Помилка вводу');
        }
    };

    return (
        <div className="space-y-4">
            <SlotLegend settings={settings} mySlot={mySlot} activeSlot={activeSlot} />

            <div className="rounded-2xl border border-border bg-bg px-4 py-4 font-mono text-sm leading-8">
                {segments.map((segment, index) => {
                    const ownerSlot = segment.slot ?? getSegmentOwnerSlot(segments, index);
                    const color = getSlotColor(settings, ownerSlot);
                    const isCurrent = index === currentIndex && !run?.is_finished;
                    const isPast = index < currentIndex || run?.is_finished;
                    const isMySegment = mySlot != null && Number(ownerSlot) === Number(mySlot);

                    let content = segment.text;
                    if (isCurrent) {
                        const done = segment.text.slice(0, typedChars);
                        const rest = segment.text.slice(typedChars);
                        content = (
                            <>
                                <span
                                    style={{
                                        textDecoration: 'underline',
                                        textDecorationThickness: '2px',
                                        textDecorationColor: activeColor,
                                    }}
                                >
                                    {done}
                                </span>
                                <span
                                    style={{
                                        backgroundColor: `${activeColor}33`,
                                        boxShadow: `inset 0 -2px 0 ${activeColor}`,
                                    }}
                                >
                                    {rest.charAt(0)}
                                </span>
                                {rest.slice(1)}
                            </>
                        );
                    }

                    const style = color
                        ? {
                            color,
                            fontWeight: isMySegment || isCurrent ? 700 : 600,
                            opacity: isPast ? 0.45 : 1,
                        }
                        : { opacity: isPast ? 0.45 : 1 };

                    return (
                        <span
                            key={`${index}-${segment.text}`}
                            style={style}
                            title={getSlotMeta(settings, ownerSlot)?.label}
                        >
                            {isCurrent ? content : segment.text}
                        </span>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                <StatusBadge
                    canType={canType}
                    practiceMode={practiceMode}
                    mySlotMeta={mySlotMeta}
                    activeSlotMeta={activeSlotMeta}
                    isFinished={run?.is_finished}
                />
                {run && !run.is_finished && (
                    <span className="text-xs text-muted">
                        Сегмент {Math.min(currentIndex + 1, segments.length)} / {segments.length}
                    </span>
                )}
            </div>

            <input
                ref={inputRef}
                type="text"
                className="sr-only"
                aria-label="Поле набору тексту"
                onKeyDown={handleKeyDown}
                disabled={!canType}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
            />

            {localError && <p className="text-sm text-red-500">{localError}</p>}
        </div>
    );
}

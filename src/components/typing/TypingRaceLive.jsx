import { useEffect, useRef, useState } from 'react';
import {
    formatExpectedChar,
    getExpectedChar,
    getSegmentOwnerSlot,
    getSlotColor,
    getSlotMeta,
    isLatinSegment,
    splitTextChars,
} from '../../utils/typingRace';

function NextCharPrompt({ char, color, segmentText }) {
    const label = formatExpectedChar(char);
    const isSpace = char === ' ';

    return (
        <div
            className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-surface px-4 py-3"
            style={{ borderColor: `${color}55` }}
        >
            <div className="min-w-[4.5rem] text-center">
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted">Наступний символ</p>
                <div
                    className="mt-1 flex min-h-14 items-center justify-center rounded-xl px-3 font-mono text-3xl font-extrabold"
                    style={{
                        color,
                        backgroundColor: `${color}18`,
                        boxShadow: `inset 0 0 0 2px ${color}`,
                    }}
                >
                    {isSpace ? (
                        <span className="text-base font-bold tracking-wide">␣</span>
                    ) : (
                        label
                    )}
                </div>
            </div>
            <div className="text-sm text-muted">
                <p>
                    Натисніть клавішу
                    <strong className="mx-1" style={{ color }}>{label}</strong>
                    на клавіатурі
                </p>
                {isSpace && <p className="mt-1 text-xs">Це пробіл — натисніть Space</p>}
                {isLatinSegment(segmentText) && (
                    <p className="mt-1 text-xs text-amber-700">Латинський фрагмент — увімкніть розкладку EN</p>
                )}
            </div>
        </div>
    );
}

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

function StatusBadge({ canType, practiceMode, practiceRelayMode, mySlotMeta, activeSlotMeta, isFinished }) {
    if (isFinished) {
        return (
            <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                Команда фінішувала
            </span>
        );
    }

    if (canType && practiceMode && !practiceRelayMode && activeSlotMeta) {
        return (
            <span
                className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                style={{ backgroundColor: `${activeSlotMeta.color}22`, color: activeSlotMeta.color }}
            >
                <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: activeSlotMeta.color }}
                />
                Тренування · зараз {activeSlotMeta.label}
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
    practiceRelayMode = false,
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
    const currentSegment = segments[currentIndex];
    const currentSegmentText = currentSegment?.text || '';
    const nextChar = run?.is_finished ? null : getExpectedChar(currentSegmentText, typedChars);

    const handleKeyDown = async (event) => {
        if (!canType || !onType) return;
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key === 'Dead' || event.key === 'Unidentified') return;
        if (splitTextChars(event.key).length !== 1) return;

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

            {canType && nextChar != null && !run?.is_finished && (
                <NextCharPrompt
                    char={nextChar}
                    color={activeColor}
                    segmentText={currentSegmentText}
                />
            )}

            <div className="rounded-2xl border border-border bg-bg px-4 py-4 font-mono text-sm leading-8">
                {segments.map((segment, index) => {
                    const ownerSlot = segment.slot ?? getSegmentOwnerSlot(segments, index);
                    const color = getSlotColor(settings, ownerSlot);
                    const isCurrent = index === currentIndex && !run?.is_finished;
                    const isPast = index < currentIndex || run?.is_finished;
                    const isMySegment = mySlot != null && Number(ownerSlot) === Number(mySlot);
                    const segmentChars = splitTextChars(segment.text || '');

                    let content = segment.text;
                    if (isCurrent) {
                        const done = segmentChars.slice(0, typedChars).join('');
                        const restChars = segmentChars.slice(typedChars);
                        const current = restChars[0] ?? '';
                        const rest = restChars.slice(1).join('');
                        const currentDisplay = current === ' ' ? '␣' : current;

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
                                    className="inline-block min-w-[0.6em] text-center"
                                    style={{
                                        backgroundColor: `${activeColor}33`,
                                        boxShadow: `inset 0 -3px 0 ${activeColor}`,
                                        color: activeColor,
                                    }}
                                >
                                    {currentDisplay}
                                </span>
                                {rest}
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
                    practiceRelayMode={practiceRelayMode}
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

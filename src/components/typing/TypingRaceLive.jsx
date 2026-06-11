import { useEffect, useRef, useState } from 'react';
import { getSlotColor } from '../../utils/typingRace';

export default function TypingRaceLive({ settings, run, canType, onType, error }) {
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
            <div className="rounded-2xl border border-border bg-bg px-4 py-4 font-mono text-sm leading-8">
                {segments.map((segment, index) => {
                    const color = getSlotColor(settings, segment.slot);
                    const isCurrent = index === currentIndex && !run?.is_finished;
                    const isPast = index < currentIndex || run?.is_finished;

                    let content = segment.text;
                    if (isCurrent) {
                        const done = segment.text.slice(0, typedChars);
                        const rest = segment.text.slice(typedChars);
                        content = (
                            <>
                                <span className="underline decoration-2 decoration-primary">{done}</span>
                                <span className="bg-primary/20">{rest.charAt(0)}</span>
                                {rest.slice(1)}
                            </>
                        );
                    }

                    const style = segment.slot != null
                        ? { color, fontWeight: 700, opacity: isPast ? 0.45 : 1 }
                        : { opacity: isPast ? 0.45 : 1 };

                    return (
                        <span key={`${index}-${segment.text}`} style={style}>
                            {isCurrent ? content : segment.text}
                        </span>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-3">
                {canType ? (
                    <span className="rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-accent">
                        Ваш хід — друкуйте
                    </span>
                ) : (
                    <span className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-muted">
                        {run?.is_finished ? 'Команда фінішувала' : 'Очікуйте свою чергу'}
                    </span>
                )}
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

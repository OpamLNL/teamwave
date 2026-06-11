import { useState } from 'react';
import { ICON_OPTIONS } from '../../utils/eventIcons';
import { updateEvent } from '../../utils/events';

export default function EventIconPicker({ event, canEdit, onUpdated }) {
    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    if (!canEdit) return null;

    const handlePick = async (icon) => {
        setSaving(true);
        try {
            const updated = await updateEvent(event.id, { icon });
            onUpdated?.(updated);
            setOpen(false);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="mt-4">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="text-sm font-semibold text-primary hover:opacity-80"
            >
                {open ? 'Сховати вибір іконки' : 'Змінити іконку'}
            </button>

            {open && (
                <div className="mt-3 flex flex-wrap gap-2">
                    {ICON_OPTIONS.map((emoji) => (
                        <button
                            key={emoji}
                            type="button"
                            disabled={saving}
                            onClick={() => handlePick(emoji)}
                            className={[
                                'flex h-10 w-10 items-center justify-center rounded-xl border text-lg transition',
                                event.icon === emoji
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border bg-bg hover:border-primary/40',
                            ].join(' ')}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

import { useRef, useState } from 'react';
import { resolveEventCoverUrl } from '../../utils/mediaUrl';
import { resolveEventIcon } from '../../utils/eventIcons';
import { uploadEventCover } from '../../utils/events';
import { EventCoverHero } from './EventCoverImage';

export default function EventCoverEditor({ event, canEdit, onUpdated }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [coverKey, setCoverKey] = useState(0);

    const coverUrl = resolveEventCoverUrl(event);
    const icon = resolveEventIcon(event);

    const handleUpload = async (file) => {
        if (!file || !canEdit) return;
        setUploading(true);
        setError('');
        try {
            const updated = await uploadEventCover(event.id, file);
            setCoverKey((k) => k + 1);
            onUpdated?.(updated);
        } catch (err) {
            setError(err.message || 'Не вдалося завантажити');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-bg">
            <EventCoverHero key={coverKey} coverUrl={coverUrl} event={event} />

            <div className="absolute left-4 top-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/30 bg-surface/90 text-3xl shadow-lg backdrop-blur">
                {icon}
            </div>

            {canEdit && (
                <div className="absolute bottom-4 right-4">
                    <button
                        type="button"
                        disabled={uploading}
                        onClick={() => fileInputRef.current?.click()}
                        className="rounded-xl bg-surface/95 px-4 py-2 text-sm font-semibold shadow backdrop-blur hover:bg-white disabled:opacity-60"
                    >
                        {uploading ? 'Завантаження…' : event.cover_url ? 'Змінити обкладинку' : 'Додати обкладинку'}
                    </button>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleUpload(e.target.files?.[0])}
                    />
                </div>
            )}

            {error && (
                <p className="absolute bottom-4 left-4 rounded-lg bg-red-500/90 px-3 py-1 text-xs font-semibold text-white">
                    {error}
                </p>
            )}
        </div>
    );
}

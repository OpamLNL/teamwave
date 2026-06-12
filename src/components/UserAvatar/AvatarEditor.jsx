import { useRef, useState } from 'react';
import UserAvatar from './UserAvatar';
import { uploadMyAvatar } from '../../utils/teammates';

export default function AvatarEditor({ user, className = 'h-20 w-20 rounded-2xl object-cover', onUpdated }) {
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState('');
    const [previewUrl, setPreviewUrl] = useState(null);
    const [avatarKey, setAvatarKey] = useState(0);

    const handleUpload = async (file) => {
        if (!file) return;

        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
        setUploading(true);
        setError('');

        try {
            const updated = await uploadMyAvatar(file);
            URL.revokeObjectURL(objectUrl);
            setPreviewUrl(null);
            setAvatarKey((key) => key + 1);
            onUpdated?.(updated);
        } catch (err) {
            URL.revokeObjectURL(objectUrl);
            setPreviewUrl(null);
            setError(err.message || 'Не вдалося завантажити аватар');
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex shrink-0 flex-col items-center gap-2">
            <UserAvatar
                key={avatarKey}
                src={previewUrl || user.avatar_url}
                userId={user.id}
                name={user.name}
                className={className}
            />

            <button
                type="button"
                disabled={uploading}
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg border border-border bg-bg px-3 py-1 text-xs font-semibold hover:bg-surface disabled:opacity-60"
            >
                {uploading ? 'Завантаження…' : user.avatar_url ? 'Змінити фото' : 'Додати фото'}
            </button>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleUpload(e.target.files?.[0])}
            />

            {error && (
                <p className="max-w-[8rem] text-center text-xs font-medium text-red-500">{error}</p>
            )}
        </div>
    );
}

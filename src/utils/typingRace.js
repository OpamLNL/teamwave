export function formatRaceTime(ms) {
    const total = Math.max(0, Number(ms) || 0);
    const minutes = Math.floor(total / 60000);
    const seconds = Math.floor((total % 60000) / 1000);
    const millis = Math.floor((total % 1000) / 10);
    if (minutes > 0) {
        return `${minutes}:${String(seconds).padStart(2, '0')}.${String(millis).padStart(2, '0')}`;
    }
    return `${seconds}.${String(millis).padStart(2, '0')} с`;
}

export function getSlotColor(settings, slot) {
    if (slot == null) return null;
    const match = settings?.slots?.find((item) => item.slot === slot);
    return match?.color || '#2563EB';
}

export function isTeamRelaySettings(settings) {
    return settings?.mode === 'team_relay' && Array.isArray(settings?.segments);
}

export function isTypingRaceActivity(activity) {
    return activity?.type === 'typing_race';
}

export function getSegmentOwnerSlot(segments, index) {
    const seg = segments?.[index];
    if (seg?.slot != null) return seg.slot;
    for (let i = index - 1; i >= 0; i -= 1) {
        if (segments[i]?.slot != null) return segments[i].slot;
    }
    return segments?.find((s) => s.slot != null)?.slot ?? 0;
}

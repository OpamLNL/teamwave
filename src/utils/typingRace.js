export const DEFAULT_TEAM_RELAY_SETTINGS = {
    mode: 'team_relay',
    team_size: 4,
    scoring: 'team_fastest_time',
    source_text: "TeamWave об'єднує віддалені команди разом швидше за всіх",
    slots: [
        { slot: 0, label: 'Гравець 1', color: '#2563EB' },
        { slot: 1, label: 'Гравець 2', color: '#DB2777' },
        { slot: 2, label: 'Гравець 3', color: '#059669' },
        { slot: 3, label: 'Гравець 4', color: '#D97706' },
    ],
    segments: [
        { text: 'TeamWave', slot: 0 },
        { text: ' ', slot: null },
        { text: "об'єднує", slot: 1 },
        { text: ' ', slot: null },
        { text: 'віддалені', slot: 2 },
        { text: ' ', slot: null },
        { text: 'команди', slot: 2 },
        { text: ' ', slot: null },
        { text: 'разом', slot: 3 },
        { text: ' ', slot: null },
        { text: 'швидше', slot: 3 },
        { text: ' ', slot: null },
        { text: 'за', slot: 3 },
        { text: ' ', slot: null },
        { text: 'всіх', slot: 3 },
    ],
    rules: [
        'Один учасник створює команду, інші надсилають запит капітану',
        'Капітан приймає або відхиляє запити на вступ',
        'Перемагає команда з найменшим сумарним часом проходження',
    ],
};

export function normalizeTypingRaceSettings(settings) {
    const raw = settings && typeof settings === 'object' ? settings : {};
    const hasSegments = Array.isArray(raw.segments) && raw.segments.length > 0;
    const isRelay = raw.mode === 'team_relay' && hasSegments;

    if (isRelay) {
        return {
            ...DEFAULT_TEAM_RELAY_SETTINGS,
            ...raw,
            team_size: Number(raw.team_size) || DEFAULT_TEAM_RELAY_SETTINGS.team_size,
            slots: raw.slots?.length ? raw.slots : DEFAULT_TEAM_RELAY_SETTINGS.slots,
            segments: raw.segments,
            rules: raw.rules?.length ? raw.rules : DEFAULT_TEAM_RELAY_SETTINGS.rules,
        };
    }

    return {
        ...DEFAULT_TEAM_RELAY_SETTINGS,
        ...raw,
        mode: 'team_relay',
        team_size: Number(raw.team_size) || DEFAULT_TEAM_RELAY_SETTINGS.team_size,
    };
}

export function resolveTypingRaceActivity(activities) {
    const activity = activities?.find((item) => item?.type === 'typing_race');
    if (!activity) return null;
    return {
        ...activity,
        settings: normalizeTypingRaceSettings(activity.settings),
    };
}

export function isTeamRelaySettings(settings) {
    const normalized = normalizeTypingRaceSettings(settings);
    return normalized.mode === 'team_relay' && Array.isArray(normalized.segments) && normalized.segments.length > 0;
}

export function isTypingRaceActivity(activity) {
    return activity?.type === 'typing_race';
}

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
    const match = settings?.slots?.find((item) => Number(item.slot) === Number(slot));
    return match?.color || '#2563EB';
}

export function getSlotMeta(settings, slot) {
    if (slot == null) return null;
    const match = settings?.slots?.find((item) => Number(item.slot) === Number(slot));
    if (!match) return null;
    return {
        slot: match.slot,
        label: match.label || `Гравець ${Number(slot) + 1}`,
        color: match.color || '#2563EB',
    };
}

export function splitTextChars(text) {
    const value = String(text ?? '');
    if (typeof Intl !== 'undefined' && Intl.Segmenter) {
        return [...new Intl.Segmenter('uk', { granularity: 'grapheme' }).segment(value)]
            .map((part) => part.segment);
    }
    return [...value];
}

export function getExpectedChar(text, typedIndex) {
    const chars = splitTextChars(text);
    const index = Number(typedIndex) || 0;
    return chars[index] ?? null;
}

export function formatExpectedChar(char) {
    if (char == null || char === '') return '—';
    if (char === ' ') return 'пробіл';
    if (char === '\n') return '↵';
    if (char === '\t') return '↹';
    return char;
}

export function isLatinSegment(text) {
    return /[A-Za-z]/.test(String(text ?? ''));
}

export function getSegmentOwnerSlot(segments, index) {
    const seg = segments?.[index];
    if (seg?.slot != null) return seg.slot;
    for (let i = index - 1; i >= 0; i -= 1) {
        if (segments[i]?.slot != null) return segments[i].slot;
    }
    return segments?.find((s) => s.slot != null)?.slot ?? 0;
}

export function getOccupiedSlots(members) {
    return [...new Set(
        (members || [])
            .map((member) => Number(member.slot_index))
            .filter((slot) => Number.isInteger(slot) && slot >= 0)
    )].sort((a, b) => a - b);
}

export function remapSlotForTeam(originalSlot, occupiedSlots) {
    const slot = Number(originalSlot);
    if (!occupiedSlots.length) return slot;
    if (occupiedSlots.includes(slot)) return slot;
    return occupiedSlots[slot % occupiedSlots.length];
}

export function adaptTypingSettingsForTeam(settings, members) {
    const base = normalizeTypingRaceSettings(settings);
    const occupiedSlots = getOccupiedSlots(members);
    const configuredSize = Number(base.team_size) || base.slots?.length || 4;

    if (!occupiedSlots.length || occupiedSlots.length >= configuredSize) {
        return base;
    }

    const memberBySlot = new Map(
        (members || []).map((member) => [Number(member.slot_index), member])
    );

    const adaptedSegments = (base.segments || []).map((segment) => {
        if (segment.slot == null) {
            return { ...segment };
        }
        return {
            ...segment,
            slot: remapSlotForTeam(segment.slot, occupiedSlots),
        };
    });

    const adaptedSlots = (base.slots || [])
        .filter((slot) => occupiedSlots.includes(Number(slot.slot)))
        .map((slot) => {
            const member = memberBySlot.get(Number(slot.slot));
            const playerNumber = occupiedSlots.indexOf(Number(slot.slot)) + 1;
            return {
                ...slot,
                label: member?.name || `Гравець ${playerNumber}`,
            };
        });

    return {
        ...base,
        team_size: occupiedSlots.length,
        slots: adaptedSlots,
        segments: adaptedSegments,
        occupied_slots: occupiedSlots,
    };
}

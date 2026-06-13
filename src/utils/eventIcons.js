export const CATEGORY_ICONS = {
    icebreaker: '🧊',
    quiz: '🧠',
    challenge: '🏆',
    combined: '🎯',
    wellness: '🌿',
    creative: '🎨',
    game: '🎮',
    hybrid: '🔀',
    collaborative: '🤝',
    themed: '🎭',
};

export const TYPE_ICONS = { ...CATEGORY_ICONS };

export const TEMPLATE_ICONS = {
    9: '⌨️',
    16: '⌨️',
    17: '🏆',
};

export const ICON_OPTIONS = [
    '📅', '🎯', '🧊', '🧠', '🏆', '🌿', '🎨', '🎮', '🔀', '🤝', '🎭',
    '⌨️', '🎈', '📸', '🗳️', '🎉', '⚡', '🌊', '🚀', '💡',
];

export function resolveEventIcon(item) {
    if (item?.icon?.trim()) return item.icon.trim();
    if (item?.template_id && TEMPLATE_ICONS[item.template_id]) {
        return TEMPLATE_ICONS[item.template_id];
    }
    if (item?.id && TEMPLATE_ICONS[item.id]) return TEMPLATE_ICONS[item.id];
    if (item?.category && CATEGORY_ICONS[item.category]) return CATEGORY_ICONS[item.category];
    const type = item?.event_type || item?.type;
    if (type && TYPE_ICONS[type]) return TYPE_ICONS[type];
    return '📅';
}

export function isTypingTemplate(template, activities = []) {
    if ([9, 16, 17].includes(template?.id)) return true;
    return activities.some((a) => a.type === 'typing_race');
}

import { resolveTypingRaceActivity } from './typingRace';

export function shouldOpenLobby(event) {
    return Boolean(resolveTypingRaceActivity(event?.activities));
}

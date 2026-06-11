export const mainNav = [
    { to: '/', label: 'Головна', icon: '⌂', end: true },
    { to: '/events', label: 'Заходи', icon: '◉' },
    { to: '/templates', label: 'Шаблони', icon: '▦' },
    { to: '/join', label: 'Приєднатися', icon: '➜' },
];

export const personalNav = [
    { to: '/cabinet', label: 'Мій профіль', icon: '◎', auth: true },
    { to: '/favorites', label: 'Улюблене', icon: '♥', auth: true },
    { to: '/notifications', label: 'Сповіщення', icon: '🔔', auth: true },
];

export const secondaryNav = [
    { to: '/about', label: 'Про нас', icon: '?' },
    { to: '/contact', label: 'Контакти', icon: '@' },
];

export const pageTitles = {
    '/': 'Головна',
    '/events': 'Заходи',
    '/templates': 'Шаблони',
    '/join': 'Приєднатися',
    '/cabinet': 'Мій профіль',
    '/favorites': 'Улюблене',
    '/notifications': 'Сповіщення',
    '/about': 'Про нас',
    '/contact': 'Контакти',
    '/admin': 'Адмінпанель',
    '/login': 'Вхід',
};

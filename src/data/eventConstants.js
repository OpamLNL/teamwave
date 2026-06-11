export const statusLabels = {
    draft: { label: 'Чернетка', className: 'bg-muted/15 text-muted' },
    planned: { label: 'Заплановано', className: 'bg-accent/15 text-accent' },
    active: { label: 'Йде зараз', className: 'bg-primary/15 text-primary' },
    finished: { label: 'Завершено', className: 'bg-border text-muted' },
};

export const activityTypes = [
    { icon: '🗳️', title: 'Poll & This or That', text: 'Миттєве голосування та icebreaker-питання' },
    { icon: '🧠', title: 'Quiz', text: 'Командні раунди з автоматичними балами' },
    { icon: '📸', title: 'Scavenger Hunt', text: 'Фото-завдання з дому або офісу' },
    { icon: '🎈', title: 'Mini-games', text: 'Typing race, balloon pop — незабаром' },
];

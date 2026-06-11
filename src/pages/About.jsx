import { Link } from 'react-router-dom';
import SectionHeader from '../components/ui/SectionHeader/SectionHeader';

export default function AboutPage() {
    return (
        <div className="space-y-14">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-7 sm:p-10">
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />

                <div className="relative max-w-4xl">
                    <p className="text-sm font-semibold tracking-widest uppercase text-muted">
                        Проєкт «TeamWave»
                    </p>
                    <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">
                        Про нас
                    </h1>
                    <p className="mt-4 text-base sm:text-lg text-muted">
                        «TeamWave» — інтерактивна вебплатформа для проведення віддалених тімбілдингових заходів:
                        квізи, опитування, scavenger hunt, live-лідерборд і готові шаблони для організаторів.
                    </p>

                    <div className="mt-7 flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/events"
                            className="rounded-2xl bg-primary text-white px-6 py-3 font-semibold hover:opacity-90 transition text-center"
                        >
                            Переглянути заходи
                        </Link>
                        <Link
                            to="/templates"
                            className="rounded-2xl border border-border bg-bg px-6 py-3 font-semibold hover:bg-surface transition text-center"
                        >
                            Бібліотека шаблонів
                        </Link>
                    </div>
                </div>
            </section>

            {/* Місія/цінності */}
            <section>
                <SectionHeader
                    title="Наша місія"
                    subtitle="Зробити фанатську творчість зручною, помітною і безпечною для спільноти."
                />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                        {
                            icon: '✨',
                            title: 'Творчість',
                            text: 'Дай простір фанфікам, арту, косплею та іншим форматам — у твоєму фандомі.',
                        },
                        {
                            icon: '🤝',
                            title: 'Спільнота',
                            text: 'Обговорення, реакції, підтримка авторів і пошук однодумців через теги.',
                        },
                        {
                            icon: '🛡️',
                            title: 'Модерація',
                            text: 'Лайки підсилюють якісний контент, а скарги допомагають підтримувати правила.',
                        },
                    ].map((c) => (
                        <div key={c.title} className="rounded-2xl border border-border bg-surface p-5">
                            <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-lg">
                                {c.icon}
                            </div>
                            <h3 className="mt-3 font-extrabold tracking-tight">{c.title}</h3>
                            <p className="mt-2 text-sm text-muted">{c.text}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Що є на платформі */}
            <section className="rounded-3xl border border-border bg-surface p-6 sm:p-8">
                <SectionHeader
                    title="Що є на платформі"
                    subtitle="Основні сценарії, які закриває головна та ключові розділи."
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <div className="rounded-2xl border border-border bg-bg p-5">
                        <h3 className="font-extrabold tracking-tight">Контент</h3>
                        <ul className="mt-3 space-y-2 text-sm text-muted">
                            <li>• Твори: фанфіки, арт, косплей та інші формати</li>
                            <li>• Пости: дискусії, питання, новини у фандомах</li>
                            <li>• Теги: швидка персоналізація та пошук</li>
                        </ul>
                    </div>
                    <div className="rounded-2xl border border-border bg-bg p-5">
                        <h3 className="font-extrabold tracking-tight">Взаємодія</h3>
                        <ul className="mt-3 space-y-2 text-sm text-muted">
                            <li>• Лайки: підтримка та сигнал якості</li>
                            <li>• Улюблене: збереження контенту під рукою</li>
                            <li>• Скарги: інструмент для модерації та безпеки</li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-7 sm:p-10">
                <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-primary/15 blur-3xl" />
                <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                            Хочеш співпрацю або маєш ідеї?
                        </h2>
                        <p className="mt-2 text-muted">
                            Напиши нам — будемо раді фідбеку щодо платформи.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Link
                            to="/contact"
                            className="rounded-2xl bg-primary text-white px-6 py-3 font-semibold hover:opacity-90 transition text-center"
                        >
                            Контакти
                        </Link>
                        <Link
                            to="/join"
                            className="rounded-2xl border border-border bg-bg px-6 py-3 font-semibold hover:bg-surface transition text-center"
                        >
                            Приєднатися за кодом
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}

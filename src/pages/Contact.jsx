import ContactForm from '../components/ContactForm/ContactForm';
import SectionHeader from '../components/ui/SectionHeader/SectionHeader';

export default function ContactPage() {
    return (
        <div className="space-y-14">
            {/* Hero */}
            <section className="relative overflow-hidden rounded-3xl border border-border bg-surface p-7 sm:p-10">
                <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent/15 blur-3xl" />

                <div className="relative max-w-4xl">
                    <p className="text-sm font-semibold tracking-widest uppercase text-muted">Підтримка та співпраця</p>
                    <h1 className="mt-3 text-3xl sm:text-5xl font-extrabold tracking-tight">Контакти</h1>
                    <p className="mt-4 text-base sm:text-lg text-muted">
                        Маєш питання, пропозиції або хочеш повідомити про проблему? Напиши нам — відповідаємо максимально швидко.
                    </p>
                </div>
            </section>

            <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Ліва колонка: контакти */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="rounded-3xl border border-border bg-surface p-6">
                        <SectionHeader title="Як з нами звʼязатись" subtitle="Оберіть зручний канал." />

                        <div className="grid grid-cols-1 gap-3">
                            {[
                                {
                                    icon: '✉️',
                                    title: 'Email',
                                    value: 'support@teamwave.ua',
                                    href: 'mailto:support@teamwave.ua',
                                },
                                {
                                    icon: '📱',
                                    title: 'Телефон',
                                    value: '+38 (0XX) XXX-XX-XX',
                                    href: null,
                                },
                                {
                                    icon: '📷',
                                    title: 'Instagram',
                                    value: '@teamwave',
                                    href: 'https://instagram.com/',
                                },
                            ].map((c) => (
                                <div key={c.title} className="rounded-2xl border border-border bg-bg p-4">
                                    <div className="flex items-start gap-3">
                                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                            {c.icon}
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-sm font-semibold text-muted">{c.title}</p>
                                            {c.href ? (
                                                <a
                                                    href={c.href}
                                                    target={c.href.startsWith('http') ? '_blank' : undefined}
                                                    rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                                                    className="font-extrabold tracking-tight hover:opacity-90 transition break-words"
                                                >
                                                    {c.value}
                                                </a>
                                            ) : (
                                                <p className="font-extrabold tracking-tight">{c.value}</p>
                                            )}
                                            <p className="text-xs text-muted mt-1">
                                                {c.title === 'Email'
                                                    ? 'Підходить для питань і фідбеку.'
                                                    : c.title === 'Instagram'
                                                      ? 'Новини, анонси та комʼюніті.'
                                                      : 'За потреби додамо реальний номер.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-3xl border border-border bg-surface p-6">
                        <SectionHeader title="FAQ" subtitle="Швидкі відповіді на часті питання." />
                        <div className="space-y-3">
                            {[
                                {
                                    q: 'Куди писати щодо скарг / модерації?',
                                    a: 'Надсилай скаргу через кнопку ⚑ на пості/творі або пиши на support@teamwave.ua.',
                                },
                                {
                                    q: 'Я знайшов(-ла) баг. Як повідомити?',
                                    a: 'Опиши кроки відтворення, браузер і скріншоти — ми швидше пофіксимо.',
                                },
                            ].map((item) => (
                                <div key={item.q} className="rounded-2xl border border-border bg-bg p-4">
                                    <p className="font-extrabold tracking-tight">{item.q}</p>
                                    <p className="mt-2 text-sm text-muted">{item.a}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Права колонка: форма */}
                <div className="lg:col-span-3 rounded-3xl border border-border bg-surface p-6 sm:p-8">
                    <SectionHeader
                        title="Написати повідомлення"
                        subtitle="Залиш свої контакти — і ми відповімо найближчим часом."
                    />
                    <ContactForm />
                </div>
            </section>
        </div>
    );
}

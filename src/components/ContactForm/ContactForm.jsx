import { useState } from 'react';
import { endpoints } from '../../api/config';

export default function ContactForm() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        setError('');
        setSuccess(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setBusy(true);
        setError('');
        setSuccess(false);

        try {
            const res = await fetch(endpoints.contact.send, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            });

            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                throw new Error(data.error || 'Не вдалося надіслати повідомлення');
            }

            setForm({ name: '', email: '', message: '' });
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Помилка надсилання');
        } finally {
            setBusy(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-5">
            <div>
                <label className="block mb-2 text-sm font-semibold text-muted" htmlFor="name">
                    Ваше імʼя
                </label>
                <input
                    type="text"
                    name="name"
                    id="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-bg text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Імʼя"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-semibold text-muted" htmlFor="email">
                    Email
                </label>
                <input
                    type="email"
                    name="email"
                    id="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-bg text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="email@example.com"
                />
            </div>
            <div>
                <label className="block mb-2 text-sm font-semibold text-muted" htmlFor="message">
                    Повідомлення
                </label>
                <textarea
                    name="message"
                    id="message"
                    value={form.message}
                    onChange={handleChange}
                    required
                    minLength={10}
                    rows={5}
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-bg text-text placeholder:text-muted/70 outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ваше повідомлення..."
                ></textarea>
            </div>

            {error && (
                <p className="text-sm text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 px-4 py-3">
                    {error}
                </p>
            )}

            {success && (
                <p className="text-sm text-green-700 dark:text-green-400 rounded-xl border border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/40 px-4 py-3">
                    Дякуємо за звернення! Ми звʼяжемось із вами найближчим часом.
                </p>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
                <p className="text-xs text-muted">
                    Натискаючи “Надіслати”, ви погоджуєтесь на обробку звернення службою підтримки.
                </p>
                <button
                    type="submit"
                    disabled={busy}
                    className="shrink-0 px-6 py-3 rounded-2xl bg-primary text-white font-semibold hover:opacity-90 transition disabled:opacity-60"
                >
                    {busy ? 'Надсилаю…' : 'Надіслати'}
                </button>
            </div>
        </form>
    );
}

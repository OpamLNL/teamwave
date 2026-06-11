import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();
    const redirectParam = searchParams.get('redirect');
    const from = redirectParam || location.state?.from || '/';
    const { user, login, loading } = useAuth();

    const [loginError, setLoginError] = useState('');

    useEffect(() => {
        if (user) navigate(from, { replace: true });
    }, [user, navigate, from]);

    const handleLogin = async () => {
        setLoginError('');
        try {
            await login();
        } catch (error) {
            console.error('Помилка входу:', error.message);
            setLoginError(error.message || 'Не вдалося увійти. Перевір, чи запущений сервер.');
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-bg text-muted">
                Завантаження…
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            <aside className="relative hidden w-[42%] overflow-hidden bg-sidebar lg:flex lg:flex-col lg:justify-between">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-accent/20" />
                <div className="absolute -right-20 top-20 h-64 w-64 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute -bottom-10 left-10 h-48 w-48 rounded-full bg-accent/15 blur-3xl" />

                <div className="relative p-10">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-2xl shadow-lg shadow-primary/30">
                            🌊
                        </div>
                        <div>
                            <p className="text-xl font-extrabold text-white">TeamWave</p>
                            <p className="text-sm text-sidebar-muted">remote team building</p>
                        </div>
                    </div>
                </div>

                <div className="relative px-10 pb-12">
                    <h1 className="max-w-md text-4xl font-extrabold leading-tight tracking-tight text-white">
                        Інтерактивні заходи для віддалених команд
                    </h1>
                    <p className="mt-4 max-w-sm text-sidebar-muted">
                        Квізи, опитування, scavenger hunt і live-лідерборд для distributed-команд.
                    </p>
                    <ul className="mt-8 space-y-3 text-sm text-sidebar-muted">
                        <li className="flex items-center gap-2">
                            <span className="text-accent">✓</span> Приєднання за кодом заходу
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-accent">✓</span> Готові шаблони icebreaker і quiz
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="text-accent">✓</span> Ролі організатора та учасника
                        </li>
                    </ul>
                </div>
            </aside>

            <main className="flex flex-1 items-center justify-center bg-bg px-4 py-10">
                <div className="w-full max-w-md space-y-6">
                    <div className="lg:hidden">
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-xl">
                                🌊
                            </div>
                            <p className="text-lg font-extrabold">TeamWave</p>
                        </div>
                    </div>

                    <div className="rounded-[1.75rem] border border-border bg-surface p-8 shadow-sm sm:p-10">
                        <h2 className="text-2xl font-extrabold tracking-tight">Увійти</h2>
                        <p className="mt-2 text-sm text-muted">
                            Авторизуйся через Google, щоб створювати заходи, зберігати шаблони та бачити результати.
                        </p>

                        <button
                            type="button"
                            onClick={handleLogin}
                            className="mt-6 w-full rounded-2xl bg-primary px-6 py-3 font-semibold text-white transition hover:opacity-90"
                        >
                            Увійти через Google
                        </button>

                        {loginError && <p className="mt-4 text-sm text-red-500">{loginError}</p>}

                        <Link
                            to="/"
                            className="mt-6 inline-flex text-sm font-semibold text-primary transition hover:opacity-80"
                        >
                            ← Продовжити без входу
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}

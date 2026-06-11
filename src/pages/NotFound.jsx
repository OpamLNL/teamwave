export default function NotFound() {
    return (
        <div className="text-center mt-20">
            <h1 className="text-4xl font-bold text-red-500">404</h1>
            <p className="mt-4 text-xl text-muted">Сторінку не знайдено</p>
            <a href="/" className="mt-6 inline-block px-4 py-2 bg-primary text-white rounded-xl hover:opacity-90 transition">
                На головну
            </a>
        </div>
    );
}

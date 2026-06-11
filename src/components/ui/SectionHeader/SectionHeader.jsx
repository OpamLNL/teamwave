import { Link } from 'react-router-dom';

export default function SectionHeader({ title, subtitle, to, linkText = 'Дивитись усе →' }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
            <div>
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">{title}</h2>
                {subtitle ? <p className="text-sm text-muted mt-1">{subtitle}</p> : null}
            </div>
            {to ? (
                <Link to={to} className="text-sm font-semibold text-primary hover:opacity-90 transition">
                    {linkText}
                </Link>
            ) : null}
        </div>
    );
}


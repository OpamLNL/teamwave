import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminGuard({ children, adminOnly = false }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return <p className="text-center text-muted py-16">Завантаження…</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: '/admin' }} />;
    }

    const isAdmin = role === 'admin';
    const isOrganizer = role === 'organizer';

    if (adminOnly && !isAdmin) {
        return <Navigate to="/" replace />;
    }

    if (!isAdmin && !isOrganizer) {
        return <Navigate to="/" replace />;
    }

    return children;
}

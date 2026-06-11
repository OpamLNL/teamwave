import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function UserCabinetPage() {
    const { user, loading } = useAuth();

    if (loading) {
        return <p className="text-muted">Завантаження…</p>;
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: '/cabinet' }} />;
    }

    return <Navigate to={`/users/${user.id}`} replace />;
}

import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import Home from './pages/Home';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import TemplatesPage from './pages/TemplatesPage';
import JoinEventPage from './pages/JoinEventPage';
import About from './pages/About';
import Contact from './pages/Contact';
import LoginPage from './pages/LoginPage';
import FavoritesPage from './pages/FavoritesPage';
import NotFound from './pages/NotFound';
import UserCabinetPage from './pages/UserCabinetPage';
import UserProfilePage from './pages/UserProfilePage';
import NotificationsPage from './pages/NotificationsPage';
import AdminPage from './pages/admin/AdminPage';
import CreateEventPage from './pages/CreateEventPage';
import EventLobbyPage from './pages/EventLobbyPage';
import TypingRacePlayPage from './pages/TypingRacePlayPage';
import TypingRacePracticePage from './pages/TypingRacePracticePage';

export default function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/events" element={<EventsPage />} />
                <Route path="/events/create" element={<CreateEventPage />} />
                <Route path="/events/create/typing" element={<CreateEventPage />} />
                <Route path="/events/:id/lobby" element={<EventLobbyPage />} />
                <Route path="/events/:id/practice" element={<TypingRacePracticePage />} />
                <Route path="/events/:id/play" element={<TypingRacePlayPage />} />
                <Route path="/events/:id" element={<EventDetailPage />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/join" element={<JoinEventPage />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/favorites" element={<FavoritesPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/cabinet" element={<UserCabinetPage />} />
                <Route path="/users/:id" element={<UserProfilePage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFound />} />
            </Route>
        </Routes>
    );
}

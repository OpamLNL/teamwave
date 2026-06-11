import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppLayout() {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <div className="min-h-screen bg-bg text-text">
            <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

            <div className="lg:pl-[17.5rem]">
                <TopBar onMenuClick={() => setMobileOpen(true)} />
                <main className="px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

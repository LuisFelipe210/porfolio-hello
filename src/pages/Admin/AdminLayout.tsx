import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    Home,
    ImageIcon,
    Settings,
    LogOut,
    Sun,
    Moon,
} from 'lucide-react';

import { Button } from '@/components/ui/button';

const menuItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/portfolio', label: 'Portfólio', icon: ImageIcon },
    { href: '/settings', label: 'Configurações', icon: Settings },
];

const AdminLayout = ({ children }: { children: React.ReactNode }) => {
    const location = useLocation();
    const pathname = location.pathname;
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isDark, setIsDark] = useState(false);

    useEffect(() => {
        // Initialize theme based on document class
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        if (!isDark) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    return (
        <div className={`flex min-h-screen ${isDark ? 'bg-gray-900 text-white' : 'bg-gray-100 text-black'}`}>
            {/* Sidebar overlay for mobile */}
            <div
                className={`fixed inset-0 bg-black bg-opacity-50 z-50 transition-opacity duration-300 md:hidden ${isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
                onClick={() => setIsSidebarOpen(false)}
            ></div>

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-64 bg-white dark:bg-gray-800 shadow-lg z-50 transform transition-transform duration-300 ease-in-out
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:shadow-none`}
            >
                <div className="flex flex-col h-full">
                    {/* Sidebar header with toggle theme and close button */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-bold">Admin</h2>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={toggleTheme}
                                aria-label="Toggle theme"
                            >
                                {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                            </Button>
                            {/* Close button visible only on mobile */}
                            <button
                                className="md:hidden p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                onClick={() => setIsSidebarOpen(false)}
                                aria-label="Close sidebar"
                            >
                                <svg
                                    className="h-6 w-6 text-gray-700 dark:text-gray-300"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Menu */}
                    <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                        {menuItems.map(({ href, label, icon: Icon }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    to={href}
                                    className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors
                                    ${
                                        isActive
                                            ? 'bg-indigo-500 text-white'
                                            : 'text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700'
                                    }`}
                                    onClick={() => setIsSidebarOpen(false)}
                                >
                                    <Icon className="h-5 w-5 flex-shrink-0" />
                                    <span className="whitespace-nowrap">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout button */}
                    <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700">
                        <Button
                            variant="ghost"
                            className="w-full flex items-center gap-3 justify-center text-sm font-medium text-gray-700 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
                            onClick={() => {
                                // Implement logout logic here
                            }}
                        >
                            <LogOut className="h-5 w-5" />
                            <span>Sair</span>
                        </Button>
                    </div>
                </div>
            </aside>

            {/* Main content area */}
            <div className="flex flex-col flex-1 min-h-screen">
                {/* Topbar */}
                <header className="flex items-center justify-between bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2 md:hidden">
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="p-2 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                        aria-label="Toggle sidebar"
                    >
                        <svg
                            className="h-6 w-6 text-gray-700 dark:text-gray-300"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={2}
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <h1 className="text-lg font-semibold">Admin Dashboard</h1>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                        </Button>
                    </div>
                </header>

                <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
            </div>
        </div>
    );
};

export default AdminLayout;
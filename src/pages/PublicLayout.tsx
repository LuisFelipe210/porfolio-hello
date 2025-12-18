import { Outlet } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import FloatingContact from '../components/FloatingContact';
import { Toaster as SonnerToaster } from "../components/ui/sonner";
import CookieConsentBanner from '../components/CookieConsentBanner';

const PublicLayout = () => {
    return (
        <>
            <main className="flex-grow">
                <Outlet />
            </main>
            <FloatingContact />
            <SonnerToaster position="bottom-right" richColors />
        </>
    );
};

export default PublicLayout;
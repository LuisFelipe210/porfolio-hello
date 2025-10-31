import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import FloatingContact from '@/components/FloatingContact';

const PublicLayout = () => {
    return (
        <>
            <Helmet>
                <title>Hellô Borges Fotografia | Página Inicial</title>
                <meta
                    name="description"
                    content="Site oficial da Hellô Borges Fotografia: portfólio, blog e serviços de fotografia profissional."
                />
            </Helmet>
            <Outlet />
            <FloatingContact />
        </>
    );
};

export default PublicLayout;
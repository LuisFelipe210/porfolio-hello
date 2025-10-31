import { Outlet } from 'react-router-dom';
import FloatingContact from '@/components/FloatingContact';

// Este componente serve como um "molde" simples.
// Ele apenas renderiza o conteúdo da página (Outlet) e o botão flutuante.
const PublicLayout = () => {
    return (
        <>
            <Outlet />
            <FloatingContact />
        </>
    );
};

export default PublicLayout;
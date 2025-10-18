import { useEffect } from 'react';
import { useNavigate, Outlet, Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, LayoutDashboard, ImageIcon } from 'lucide-react';
import Logo from "@/assets/logo.svg";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Efeito que verifica a autenticação do usuário
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        // Se não houver token, redireciona para a página de login
        if (!token) {
            navigate('/admin/login');
        }
    }, [navigate]);

    // Função para fazer logout
    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/admin/login');
    };

    // Função auxiliar para verificar se o link do menu está ativo
    const isLinkActive = (path: string) => {
        return location.pathname.includes(path);
    };

    return (
        <div className="flex min-h-screen bg-secondary/20">
            {/* Sidebar de Navegação */}
            <aside className="w-64 bg-card border-r p-4 flex flex-col">
                <div className="flex items-center gap-2 mb-10">
                    <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                    <span className="text-xl font-semibold">Painel Admin</span>
                </div>

                <nav className="flex flex-col gap-2">
                    <Link to="/admin/portfolio">
                        <Button
                            variant={isLinkActive('/admin/portfolio') ? "secondary" : "ghost"}
                            className="w-full justify-start"
                        >
                            <ImageIcon className="mr-2 h-4 w-4" />
                            Portfólio
                        </Button>
                    </Link>
                    {/* Adicione outros links do menu aqui no futuro. Ex:
          <Link to="/admin/servicos">
            <Button variant="ghost" className="w-full justify-start">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Serviços
            </Button>
          </Link>
          */}
                </nav>

                <div className="mt-auto">
                    <Button variant="outline" className="w-full" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Conteúdo Principal da Página */}
            <main className="flex-1 p-6 md:p-8 overflow-auto">
                <Outlet /> {/* As páginas filhas (como AdminPortfolio) serão renderizadas aqui */}
            </main>
        </div>
    );
};

export default AdminLayout;
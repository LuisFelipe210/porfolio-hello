import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { LogOut, Users, GalleryHorizontal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Componente simples para proteger a rota
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const navigate = useNavigate();
    const token = localStorage.getItem('adminAuthToken');

    useEffect(() => {
        if (!token) {
            navigate('/admin/login');
        }
    }, [token, navigate]);

    return token ? children : null;
};

// Funções de fetch para os dados
const fetchAdminData = async () => {
    const token = localStorage.getItem('adminAuthToken');
    const [clientsRes, galleriesRes] = await Promise.all([
        fetch('/api/admin/clients', { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch('/api/admin/galleries', { headers: { 'Authorization': `Bearer ${token}` } }),
    ]);
    if (!clientsRes.ok || !galleriesRes.ok) throw new Error('Falha ao buscar dados do dashboard.');
    return {
        clients: await clientsRes.json(),
        galleries: await galleriesRes.json(),
    };
};

const AdminDashboardPage = () => {
    const navigate = useNavigate();
    const { data, isLoading, error } = useQuery({
        queryKey: ['adminDashboard'],
        queryFn: fetchAdminData,
        retry: false,
    });

    const handleLogout = () => {
        localStorage.removeItem('adminAuthToken');
        navigate('/admin/login');
    };

    if (error) {
        // Se der erro (ex: token expirado), força o logout
        handleLogout();
        return null;
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-secondary/20 p-4 sm:p-8">
                <header className="container mx-auto max-w-7xl flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-semibold">Dashboard</h1>
                    <Button variant="outline" onClick={handleLogout}>
                        <LogOut className="mr-2 h-4 w-4" />
                        Sair
                    </Button>
                </header>
                <main className="container mx-auto max-w-7xl">
                    {isLoading ? <p>Carregando dashboard...</p> : (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Card de Clientes */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
                                    <Users className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.clients?.length || 0}</div>
                                </CardContent>
                            </Card>

                            {/* Card de Galerias */}
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Total de Galerias</CardTitle>
                                    <GalleryHorizontal className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{data?.galleries?.length || 0}</div>
                                </CardContent>
                            </Card>

                            {/* Futuramente: Forms para adicionar cliente/galeria, listas, etc. */}
                        </div>
                    )}
                </main>
            </div>
        </ProtectedRoute>
    );
};

export default AdminDashboardPage;
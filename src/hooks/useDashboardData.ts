import { useQuery } from '@tanstack/react-query';

interface DashboardData {
    stats: {
        clients: number;
        portfolio: number;
        posts: number;
        testimonials: number;
        portfolioByCategory: { _id: string; count: number }[];
        galleryStatus: { pending: number; unread: number };
    };
    activity: {
        lastMessage: { name: string; createdAt: string } | null;
        lastSelection: { clientInfo: { name: string }; selectionDate: string } | null;
        latestClients: { _id: string; name: string }[];
        reservedDates: string[];
    };
}

const fetchDashboardData = async (): Promise<DashboardData> => {
    const token = localStorage.getItem('authToken');
    const res = await fetch('/api/admin/dashboard-stats', {
        headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error('Erro ao buscar dados do dashboard.');
    const data = await res.json();

    if (data.activity.reservedDates) {
        data.activity.reservedDates.sort((a: string, b: string) => new Date(a).getTime() - new Date(b).getTime());
    }

    return data;
};

export const useDashboardData = () => {
    return useQuery<DashboardData>({
        queryKey: ['dashboardData'],
        queryFn: fetchDashboardData,
        staleTime: 5 * 60 * 1000,
        refetchInterval: 15 * 1000,
        refetchIntervalInBackground: true,
    });
};
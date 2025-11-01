import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit, FolderKanban, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Client {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    createdAt: string;
    galleryCount: number;
}

interface ClientCardProps {
    client: Client;
    isSelected: boolean;
    onSelectionChange: (id: string, checked: boolean) => void;
    onEdit: (client: Client) => void;
    onCopy: (text: string, label: string) => void;
}

const ClientCard = ({ client, isSelected, onSelectionChange, onEdit, onCopy }: ClientCardProps) => {
    return (
        <Card className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md p-4 flex flex-col gap-4 border border-white/10 relative">
            <input
                type="checkbox"
                className="absolute top-4 left-4 w-5 h-5 accent-orange-500 bg-transparent rounded"
                checked={isSelected}
                onChange={(e) => onSelectionChange(client._id, e.target.checked)}
            />
            <div className="flex-1 pl-8">
                <h3 className="font-semibold text-white text-lg">{client.name}</h3>
                <p className="text-sm text-white/70 flex items-center gap-2">
                    {client.email}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-white/70 hover:text-white" onClick={() => onCopy(client.email, 'Email')} aria-label="Copiar Email">
                        <Copy className="h-3 w-3" />
                    </Button>
                </p>
                {client.phone && <p className="text-sm text-white/70">{client.phone}</p>}
            </div>
            <div className="flex gap-2 justify-end">
                <Button asChild variant="default" className="bg-orange-500 hover:bg-orange-600 rounded-xl text-white flex-1 font-semibold">
                    <Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`}>
                        <FolderKanban className="h-4 w-4 mr-2" /> Ver Galerias ({client.galleryCount})
                    </Link>
                </Button>
                <Button size="icon" className="bg-white/10 text-white rounded-xl hover:bg-white/20" onClick={() => onEdit(client)} aria-label="Editar Cliente">
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
        </Card>
    );
};

export default ClientCard;
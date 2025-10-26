import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { GalleryHorizontal, Edit, Copy } from 'lucide-react';

interface Client {
    _id: string;
    name: string;
    email: string;
}

interface ClientCardProps {
    client: Client;
    isSelected: boolean;
    onSelectionChange: (id: string, checked: boolean) => void;
    onEdit: (client: Client) => void;
    onCopy: (text: string, label: string) => void;
}

const ClientCard = React.memo(({ client, isSelected, onSelectionChange, onEdit, onCopy }: ClientCardProps) => {
    return (
        // --- CORREÇÃO: Animação removida daqui ---
        <div className="bg-black/70 backdrop-blur-md rounded-3xl shadow-md border border-white/10 flex flex-col p-6 gap-4 relative transition-all duration-300 hover:border-orange-500/50">
            <div className="absolute top-4 left-4">
                <input
                    type="checkbox"
                    id={`client-check-${client._id}`}
                    className="w-5 h-5 accent-orange-500 bg-transparent border-white/20 rounded"
                    checked={isSelected}
                    onChange={(e) => onSelectionChange(client._id, e.target.checked)}
                />
            </div>
            <div className="flex-1 flex flex-col justify-center text-center items-center gap-1 pl-6">
                <h2 className="text-xl font-semibold text-white truncate w-full" title={client.name}>{client.name}</h2>
                <div className="flex items-center gap-2 text-white/80">
                    <span className="truncate" title={client.email}>{client.email}</span>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full hover:bg-white/10" onClick={() => onCopy(client.email, "Email")}><Copy className="h-4 w-4" /></Button>
                </div>
            </div>
            <div className="flex gap-2 w-full">
                <Button asChild className="w-full bg-white/10 rounded-xl hover:bg-white/20 transition-all text-white">
                    <Link to={`/admin/clients/${client._id}/${encodeURIComponent(client.name)}`}>
                        <GalleryHorizontal className="mr-2 h-4 w-4" />
                        Galerias
                    </Link>
                </Button>
                <Button size="icon" variant="ghost" className="bg-white/10 rounded-xl hover:bg-white/20 aspect-square" onClick={() => onEdit(client)}>
                    <Edit className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
});

export default ClientCard;
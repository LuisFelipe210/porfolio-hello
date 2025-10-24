import React from 'react';
import { Loader2 } from 'lucide-react';
import Logo from '@/assets/logo.svg'; // 1. Importe a sua logo

interface SelectionSendingOverlayProps {
    isVisible: boolean;
}

export const SelectionSendingOverlay: React.FC<SelectionSendingOverlayProps> = ({ isVisible }) => {
    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-xl animate-in fade-in duration-300">

            {/* CAIXA DE MENSAGEM ESTILIZADA */}
            <div className="flex flex-col items-center gap-6 p-8 rounded-2xl shadow-2xl
                           bg-zinc-900/80 border border-white/10 max-w-sm text-center
                           animate-in fade-in zoom-in-95 duration-500">

                {/* Sua Logo */}
                <img
                    src={Logo}
                    alt="Logo Hellô Borges Fotografia"
                    className="h-10 w-auto"
                />

                {/* Spinner com a cor do seu site */}
                <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />

                {/* Título */}
                <h2 className="text-2xl font-bold text-white">
                    Enviando sua seleção...
                </h2>

                {/* Mensagem */}
                <p className="text-gray-300">
                    Por favor, aguarde. Isto pode demorar alguns instantes.
                </p>
            </div>
        </div>
    );
};
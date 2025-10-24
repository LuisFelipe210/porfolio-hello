import { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface MessagesContextType {
    hasUnreadMessages: boolean;
    refreshMessages: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType>({
    hasUnreadMessages: false,
    refreshMessages: async () => {},
});

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    const refreshMessages = async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setHasUnreadMessages(false);
                return;
            }

            const response = await fetch("/api/messages", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar dados da caixa de entrada');
            }

            const data = await response.json();

            // Verifica se existe alguma mensagem de contato não lida
            const unreadContactMessages = data.messages.some((msg: any) => !msg.read);
            // Verifica se existe alguma seleção de cliente não lida
            const unreadSelections = data.selections.some((sel: any) => !sel.read);

            // A notificação será ativada se qualquer uma das condições for verdadeira
            setHasUnreadMessages(unreadContactMessages || unreadSelections);

        } catch (error) {
            console.error("Erro ao checar notificações:", error);
            setHasUnreadMessages(false); // Garante que o estado seja falso em caso de erro
        }
    };

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            refreshMessages();
        }
    }, []);

    return (
        <MessagesContext.Provider value={{ hasUnreadMessages, refreshMessages }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => useContext(MessagesContext);
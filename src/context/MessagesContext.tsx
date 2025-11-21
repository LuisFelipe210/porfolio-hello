import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface MessagesContextType {
    hasUnreadMessages: boolean;
    refreshMessages: () => Promise<void>;
}

const MessagesContext = createContext<MessagesContextType | undefined>(undefined);

export const MessagesProvider = ({ children }: { children: ReactNode }) => {
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);

    const refreshMessages = useCallback(async () => {
        try {
            const token = localStorage.getItem("authToken");
            if (!token) {
                setHasUnreadMessages(false);
                return;
            }

            const response = await fetch("/api/messages?action=getGalleries", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar dados da caixa de entrada');
            }

            const data = await response.json();

            const unreadContactMessages = data.messages?.some((msg: { read: boolean }) => !msg.read) || false;
            const unreadSelections = data.selections?.some((sel: { read: boolean }) => !sel.read) || false;

            setHasUnreadMessages(unreadContactMessages || unreadSelections);

        } catch (error) {
            console.error("Erro ao checar notificações:", error);
            setHasUnreadMessages(false);
        }
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        if (token) {
            refreshMessages();
        }
    }, [refreshMessages]);

    return (
        <MessagesContext.Provider value={{ hasUnreadMessages, refreshMessages }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => {
    const context = useContext(MessagesContext);
    if (context === undefined) {
        throw new Error("useMessages deve ser usado dentro de um MessagesProvider");
    }
    return context;
};
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
            const response = await fetch("/api/messages", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await response.json();

            const unreadExists = data.messages.some((msg: any) => !msg.read);
            setHasUnreadMessages(unreadExists);
        } catch (error) {
            console.error("Erro ao checar mensagens:", error);
        }
    };

    useEffect(() => {
        refreshMessages();
    }, []);

    return (
        <MessagesContext.Provider value={{ hasUnreadMessages, refreshMessages }}>
            {children}
        </MessagesContext.Provider>
    );
};

export const useMessages = () => useContext(MessagesContext);
// src/components/Chatbot.tsx

import React, { useEffect } from 'react';

const Chatbot = () => {
    useEffect(() => {
        // Cria o elemento script
        const script = document.createElement('script');

        // ATENÇÃO: Substitua a linha abaixo pela URL do script do SEU serviço de chatbot
        script.src = "//code.servidor-de-chat.com/widget.js";

        script.async = true;

        // Adiciona o script ao final do corpo do documento
        document.body.appendChild(script);

        // Função de limpeza para remover o script quando o componente for desmontado
        return () => {
            document.body.removeChild(script);
        };
    }, []); // O array vazio [] garante que o script seja adicionado apenas uma vez

    return null; // Este componente não renderiza nada na tela
};

export default Chatbot;
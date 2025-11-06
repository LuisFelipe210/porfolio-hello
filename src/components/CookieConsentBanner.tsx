import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Cookie } from 'lucide-react';

// Chave que usaremos para guardar a decisão no localStorage
const COOKIE_CONSENT_KEY = "helloBorgesCookieConsent";

const CookieConsentBanner: React.FC = () => {
    // Estado para controlar se o banner deve ser visível
    const [isVisible, setIsVisible] = useState(false);

    // No momento em que o componente é carregado, verificamos o localStorage
    useEffect(() => {
        const consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY);
        // Se o consentimento ainda NÃO foi dado ("true"), mostramos o banner
        if (consentGiven !== "true") {
            setIsVisible(true);
        }
    }, []);

    // Função para aceitar e esconder o banner
    const handleAccept = () => {
        // Guarda a decisão no localStorage para não perguntar de novo
        localStorage.setItem(COOKIE_CONSENT_KEY, "true");
        setIsVisible(false);
    };

    // Se não for para ser visível (já aceitou), não renderiza nada
    if (!isVisible) {
        return null;
    }

    // Renderiza o banner usando os componentes Alert e Button do seu site
    return (
        <Alert className="fixed bottom-4 left-4 md:bottom-8 md:left-8 w-[calc(100%-2rem)] max-w-md z-50 shadow-lg border-primary/20 bg-background/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-4">

            {/* Ícone a condizer */}
            <Cookie className="h-5 w-5 text-primary" />

            <AlertTitle className="font-bold text-lg text-foreground">
                Usamos cookies
            </AlertTitle>

            <AlertDescription className="text-sm text-muted-foreground pr-4">
                Nós usamos cookies essenciais e de preferência para melhorar sua experiência.
                Ao continuar, você concorda com nossa{" "}
                <Link
                    to="/politica-de-privacidade"
                    className="font-semibold text-primary underline hover:text-primary/80"
                >
                    Política de Privacidade
                </Link>.
            </AlertDescription>

            <div className="mt-4 flex justify-end">
                <Button onClick={handleAccept} size="sm">
                    Entendi
                </Button>
            </div>
        </Alert>
    );
};

export default CookieConsentBanner;
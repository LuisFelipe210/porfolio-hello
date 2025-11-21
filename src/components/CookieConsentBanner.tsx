import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Cookie } from 'lucide-react';

const COOKIE_CONSENT_KEY = "helloBorgesCookieConsent";

const CookieConsentBanner: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consentGiven = localStorage.getItem(COOKIE_CONSENT_KEY);
        if (consentGiven !== "true") {
            setIsVisible(true);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, "true");
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed bottom-0 left-0 w-full md:w-auto md:bottom-8 md:left-8 z-[9999] p-4 md:p-0 animate-in slide-in-from-bottom-4 duration-700">

            <div className="bg-white border border-zinc-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] p-8 max-w-md relative">

                <div className="absolute top-0 left-0 w-full h-[3px] bg-orange-500"></div>

                <div className="flex items-start gap-5">
                    <div className="mt-1 p-2 bg-zinc-50 border border-zinc-100 shrink-0 text-orange-600">
                        <Cookie className="h-6 w-6" strokeWidth={1.5} />
                    </div>

                    <div className="space-y-3">
                        <h3 className="font-serif text-xl text-zinc-900 leading-none">
                            Privacidade & Cookies
                        </h3>

                        <p className="text-sm text-zinc-600 font-light leading-relaxed">
                            Utilizamos cookies para melhorar sua experiência visual. Ao continuar navegando, você concorda com nossa{" "}
                            <Link
                                to="/politica-de-privacidade"
                                className="text-zinc-900 font-bold border-b border-zinc-300 hover:text-orange-600 hover:border-orange-600 transition-all"
                            >
                                Política de Privacidade
                            </Link>.
                        </p>
                    </div>
                </div>

                <div className="mt-8 flex justify-end">
                    <Button
                        onClick={handleAccept}
                        className="rounded-none bg-zinc-900 text-white hover:bg-orange-600 uppercase tracking-widest text-xs px-8 py-6 h-auto transition-all duration-300 w-full md:w-auto shadow-none"
                    >
                        Concordar e Fechar
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CookieConsentBanner;
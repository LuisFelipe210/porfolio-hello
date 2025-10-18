import { useState, useEffect } from 'react';
import Logo from "../assets/logo.svg";
import { Instagram, Mail, MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { Skeleton } from './ui/skeleton';

const Footer = () => {
    const [settings, setSettings] = useState({ whatsapp: '', email: '', instagram: '', location: '' });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch('/api/settings');
                const data = await response.json();
                if (data) {
                    setSettings(data);
                }
            } catch (error) {
                console.error("Erro ao buscar configurações do rodapé:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer className="bg-primary text-primary-foreground py-12">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-4 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="flex items-center mb-4 space-x-3">
                            <img src={Logo} alt="Hellô Borges" className="h-10 w-auto" />
                            <span className="text-2xl font-light">Hellô Borges</span>
                        </div>
                        <p className="text-primary-foreground/80 text-sm leading-relaxed">Fotografia profissional com sensibilidade artística, capturando momentos únicos e emocionantes.</p>
                    </div>

                    {/* Quick Links */}
                    {/* ... (sem alterações aqui) ... */}

                    {/* Contact */}
                    <div>
                        <h4 className="font-light mb-4">Contato</h4>
                        {isLoading ? (
                            <div className="space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-5 w-full" /><Skeleton className="h-5 w-4/5" /></div>
                        ) : (
                            <div className="space-y-3 text-sm">
                                <a href={`https://wa.me/${settings.whatsapp}?text=Olá`} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-accent transition-colors">
                                    <FaWhatsapp className="w-4 h-4 mr-2 text-accent" />
                                    <span>{settings.whatsapp}</span>
                                </a>
                                <a href={`mailto:${settings.email}`} className="flex items-center hover:text-accent transition-colors">
                                    <Mail className="w-4 h-4 mr-2 text-accent" />
                                    <span>{settings.email}</span>
                                </a>
                                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center hover:text-accent transition-colors">
                                    <Instagram className="w-4 h-4 mr-2 text-accent" />
                                    <span>@{settings.instagram.split('/').pop()}</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Location and Hours */}
                    <div>
                        <h4 className="font-light mb-4">Atendimento</h4>
                        {isLoading ? (
                            <div className="space-y-3"><Skeleton className="h-5 w-3/4" /><Skeleton className="h-20 w-full" /></div>
                        ) : (
                            <div className="space-y-3 text-sm">
                                <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2 text-accent" />
                                    <span>{settings.location}</span>
                                </div>
                                <div className="elegant-border p-3 bg-primary/50">
                                    {/* ... (horários podem ser mantidos fixos ou adicionados ao painel) ... */}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-primary-foreground/20 pt-8 text-center">
                    <p className="text-sm text-primary-foreground/60">© {new Date().getFullYear()} Hellô Borges Fotografia. Todos os direitos reservados.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
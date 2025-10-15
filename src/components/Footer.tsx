import { Instagram, Mail } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";

const Footer = () => {
    return (
        <footer className="bg-primary text-primary-foreground py-12">
            <div className="container mx-auto px-6 max-w-6xl">
                <div className="grid md:grid-cols-3 gap-8 mb-8">
                    {/* Brand */}
                    <div>
                        <div className="text-3xl font-light mb-4">Hellô Borges</div>
                        <p className="text-primary-foreground/80 text-sm leading-relaxed">
                            Fotografia profissional com sensibilidade artística,
                            capturando momentos únicos e emocionantes.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h4 className="font-light mb-4">Navegação</h4>
                        <div className="space-y-2 text-sm">
                            <button
                                onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}
                                className="block hover:text-accent transition-colors"
                            >
                                Sobre
                            </button>
                            <button
                                onClick={() => document.getElementById("portfolio")?.scrollIntoView({ behavior: "smooth" })}
                                className="block hover:text-accent transition-colors"
                            >
                                Portfolio
                            </button>
                            <button
                                onClick={() => document.getElementById("services")?.scrollIntoView({ behavior: "smooth" })}
                                className="block hover:text-accent transition-colors"
                            >
                                Serviços
                            </button>
                            <button
                                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
                                className="block hover:text-accent transition-colors"
                            >
                                Contato
                            </button>
                        </div>
                    </div>

                    {/* Contact */}
                    <div>
                        <h4 className="font-light mb-4">Contato</h4>
                        <div className="space-y-3 text-sm">
                            <a
                                href="https://wa.me/5574991248392"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-accent transition-colors"
                            >
                                <FaWhatsapp className="w-4 h-4 mr-2 text-accent" />
                                <span>(74) 99124-8392</span>
                            </a>
                            <a
                                href="mailto:contato@helloborges.com.br"
                                className="flex items-center hover:text-accent transition-colors"
                            >
                                <Mail className="w-4 h-4 mr-2 text-accent" />
                                <span>contato@helloborges.com.br</span>
                            </a>
                            <a
                                href="https://www.instagram.com/hello.borges.fotografia"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center hover:text-accent transition-colors"
                            >
                                <Instagram className="w-4 h-4 mr-2 text-accent" />
                                <span>@hello.borges.fotografia</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-primary-foreground/20 pt-8 text-center">
                    <p className="text-sm text-primary-foreground/60">
                        © 2025 Hellô Borges Fotografia. Todos os direitos reservados.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
import { Instagram, Mail, Phone } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="text-2xl font-light mb-4">Hello Borges</div>
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
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-accent" />
                <span>(11) 99999-9999</span>
              </div>
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-accent" />
                <span>contato@helloborges.com.br</span>
              </div>
              <div className="flex items-center">
                <Instagram className="w-4 h-4 mr-2 text-accent" />
                <span>@hello.borges.fotografia</span>
              </div>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-primary-foreground/20 pt-8 text-center">
          <p className="text-sm text-primary-foreground/60">
            © 2024 Hello Borges Fotografia. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;